"""
ScamShield Transaction Risk Scoring Module
Rule-based evaluation for payment and transaction safety.
Evaluates payee risk, amount anomalies, velocity flags, payment memo cues, and anomalous timestamp hours.

ZERO CROSS-IMPORTS:
Does not import text_risk, url_risk, or fusion.
Thresholds, rules, and point values are imported from app.config.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
import re

from app.config import (
    SAFE_THRESHOLD,
    DANGEROUS_THRESHOLD,
    HIGH_RISK_PAYEE_PATTERNS,
    SUSPICIOUS_NOTES_PATTERNS,
    SUSPICIOUS_ROUND_AMOUNTS,
    TRANSACTION_LARGE_AMOUNT_THRESHOLD,
    TRANSACTION_MODERATE_AMOUNT_THRESHOLD,
    TXN_POINTS_LARGE_FIRST_TIME,
    TXN_POINTS_MODERATE_FIRST_TIME,
    TXN_POINTS_NEW_PAYEE,
    TXN_POINTS_ROUND_AMOUNT,
    TXN_POINTS_IRREVERSIBLE_CHANNEL,
    TXN_POINTS_ANOMALOUS_HOUR,
    UNUSUAL_HOURS_START,
    UNUSUAL_HOURS_END,
    get_verdict,
)


@dataclass
class TransactionRiskFactor:
    factor: str
    severity: str  # Low, Medium, High, Critical
    description: str
    points_added: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "factor": self.factor,
            "severity": self.severity,
            "description": self.description,
            "points_added": self.points_added,
        }


@dataclass
class TransactionRiskResult:
    score: int  # 0 to 100
    label: str  # Safe, Suspicious, Dangerous
    reasons: List[str] = field(default_factory=list)
    risk_factors: List[TransactionRiskFactor] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "score": self.score,
            "label": self.label,
            "reasons": self.reasons,
            "risk_factors": [f.to_dict() for f in self.risk_factors],
        }


class TransactionRiskScorer:
    """Independent rule-based transaction risk scorer."""

    def analyze(
        self,
        payee: str,
        amount: float,
        timestamp: Optional[str] = None,
        account_type: Optional[str] = "upi",
        is_first_time: bool = True,
        notes: Optional[str] = None,
    ) -> TransactionRiskResult:
        """
        Evaluate payment parameters and return integer 0-100 risk score and verdict.
        Uses calibrated 'low detected risk' language.
        """
        score = 0
        factors: List[TransactionRiskFactor] = []
        reasons: List[str] = []

        clean_payee = (payee or "").strip().lower()
        clean_notes = (notes or "").strip().lower()
        account_type = (account_type or "upi").strip().lower()

        # 1. Payee string pattern analysis
        for pattern, desc, points, severity in HIGH_RISK_PAYEE_PATTERNS:
            if re.search(pattern, clean_payee, re.IGNORECASE):
                score += points
                factors.append(TransactionRiskFactor(
                    factor="High-Risk Payee Keyword",
                    severity=severity,
                    description=desc,
                    points_added=points
                ))
                reasons.append(desc)

        # 2. First-time transfer checks
        if is_first_time:
            if amount >= TRANSACTION_LARGE_AMOUNT_THRESHOLD:
                pts = TXN_POINTS_LARGE_FIRST_TIME
                score += pts
                factors.append(TransactionRiskFactor(
                    factor="Large First-Time Transfer",
                    severity="High",
                    description=f"High monetary value (> {int(TRANSACTION_LARGE_AMOUNT_THRESHOLD):,} USD / INR) sent to an unverified first-time recipient",
                    points_added=pts
                ))
                reasons.append("High amount transferred to a first-time payee")
            elif amount >= TRANSACTION_MODERATE_AMOUNT_THRESHOLD:
                pts = TXN_POINTS_MODERATE_FIRST_TIME
                score += pts
                factors.append(TransactionRiskFactor(
                    factor="Moderate First-Time Transfer",
                    severity="Medium",
                    description="Moderate value transfer to first-time recipient",
                    points_added=pts
                ))
                reasons.append("First-time transaction to new recipient")
            else:
                pts = TXN_POINTS_NEW_PAYEE
                score += pts
                factors.append(TransactionRiskFactor(
                    factor="New Payee",
                    severity="Low",
                    description="First transaction with this payee account",
                    points_added=pts
                ))

        # 3. Suspicious round amount check
        if amount in SUSPICIOUS_ROUND_AMOUNTS:
            pts = TXN_POINTS_ROUND_AMOUNT
            score += pts
            factors.append(TransactionRiskFactor(
                factor="Structured/Round Amount",
                severity="Medium",
                description=f"Amount {amount:,.2f} matches known fraud psychological bait thresholds",
                points_added=pts
            ))
            reasons.append(f"Structured psychological round amount: {amount}")

        # 4. Account type risk
        if account_type in ("crypto", "giftcard", "wallet_transfer"):
            pts = TXN_POINTS_IRREVERSIBLE_CHANNEL
            score += pts
            factors.append(TransactionRiskFactor(
                factor="Irreversible Payment Channel",
                severity="High",
                description=f"Channel '{account_type}' offers zero fraud chargeback or escrow recovery",
                points_added=pts
            ))
            reasons.append(f"High risk payment channel ({account_type})")

        # 5. Unusual Time-of-Day Analysis
        try:
            if timestamp:
                dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            else:
                dt = datetime.now()
            hour = dt.hour
            if UNUSUAL_HOURS_START <= hour <= UNUSUAL_HOURS_END:
                pts = TXN_POINTS_ANOMALOUS_HOUR
                score += pts
                factors.append(TransactionRiskFactor(
                    factor="Anomalous Late-Night Hour",
                    severity="Medium",
                    description=f"Transaction initiated at {hour:02d}:00 (typical fraud time window 00:00-05:59)",
                    points_added=pts
                ))
                reasons.append("Transaction initiated during anomalous late-night hours")
        except Exception:
            pass

        # 6. Payment Notes / Memo inspection
        if clean_notes:
            for pattern, desc, points, severity in SUSPICIOUS_NOTES_PATTERNS:
                if re.search(pattern, clean_notes, re.IGNORECASE):
                    score += points
                    factors.append(TransactionRiskFactor(
                        factor="Suspicious Payment Memo",
                        severity=severity,
                        description=desc,
                        points_added=points
                    ))
                    reasons.append(desc)

        # Cap score at 100
        final_score = min(100, score)
        label = get_verdict(final_score)

        if final_score < SAFE_THRESHOLD and not reasons:
            reasons.append("Low detected risk: Transaction parameters are within baseline trusted thresholds")

        return TransactionRiskResult(
            score=final_score,
            label=label,
            reasons=list(dict.fromkeys(reasons)),
            risk_factors=factors,
        )


default_transaction_scorer = TransactionRiskScorer()

def score_transaction_risk(
    payee: str,
    amount: float,
    timestamp: Optional[str] = None,
    account_type: Optional[str] = "upi",
    is_first_time: bool = True,
    notes: Optional[str] = None,
) -> TransactionRiskResult:
    """Convenience function to evaluate transaction risk."""
    return default_transaction_scorer.analyze(
        payee=payee,
        amount=amount,
        timestamp=timestamp,
        account_type=account_type,
        is_first_time=is_first_time,
        notes=notes,
    )
