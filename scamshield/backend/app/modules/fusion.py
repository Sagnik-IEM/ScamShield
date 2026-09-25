"""
ScamShield Fusion Engine Module
Combines scores from independent modalities (text_risk, url_risk, and optionally transaction_risk)
into a unified, calibrated verdict on a 0-100 scale.

ZERO CROSS-IMPORTS:
Does not import text_risk, url_risk, or transaction_risk.
Thresholds, weights, and labels are imported from app.config.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from app.config import (
    SAFE_THRESHOLD,
    DANGEROUS_THRESHOLD,
    DEFAULT_WEIGHTS,
    TEXT_WEIGHT,
    URL_WEIGHT,
    TRANSACTION_WEIGHT,
    get_verdict,
)


@dataclass
class FusionResult:
    overall_score: float  # 0.0 to 100.0
    verdict: str  # Safe, Suspicious, Dangerous
    confidence: float  # 0.0 to 1.0
    breakdown: Dict[str, Any]
    reasons: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "overall_score": round(self.overall_score, 2),
            "verdict": self.verdict,
            "confidence": round(self.confidence, 3),
            "breakdown": self.breakdown,
            "reasons": self.reasons,
        }


class FusionEngine:
    """
    Extensible multi-modal risk fusion engine.
    Computes weighted normalized score across active modalities and maps to verdict.
    """

    def __init__(
        self,
        text_weight: float = TEXT_WEIGHT,
        url_weight: float = URL_WEIGHT,
        transaction_weight: float = TRANSACTION_WEIGHT,
    ):
        self.weights = {
            "text": text_weight,
            "url": url_weight,
            "transaction": transaction_weight,
        }

    def compute_verdict(self, score: float) -> str:
        """Map 0-100 score to Safe, Suspicious, Dangerous using config logic."""
        return get_verdict(score)

    def compute_confidence(self, overall_score: float, modality_scores: Dict[str, int]) -> float:
        """
        Confidence reflects agreement between modalities and distance from ambiguity boundaries.
        Boundary zones (near 40 or near 75) slightly reduce confidence.
        """
        dist_40 = abs(overall_score - float(SAFE_THRESHOLD))
        dist_75 = abs(overall_score - float(DANGEROUS_THRESHOLD))
        min_boundary_dist = min(dist_40, dist_75)

        base_confidence = 0.75 + min(0.20, (min_boundary_dist / 35.0) * 0.20)

        # Variance penalty if text and url scores diverge drastically
        if "text" in modality_scores and "url" in modality_scores:
            divergence = abs(modality_scores["text"] - modality_scores["url"])
            divergence_penalty = (divergence / 100.0) * 0.10
            base_confidence -= divergence_penalty

        return max(0.50, min(0.99, base_confidence))

    def fuse(
        self,
        text_score: int,
        url_score: int,
        transaction_score: Optional[int] = None,
        custom_weights: Optional[Dict[str, float]] = None,
        has_urls: bool = True,
        text_reasons: Optional[List[str]] = None,
        url_reasons: Optional[List[str]] = None,
        transaction_reasons: Optional[List[str]] = None,
    ) -> FusionResult:
        """
        Fuse individual modality scores into overall risk verdict.
        Only text_score and url_score are required for standard message checking.
        """
        active_weights = dict(custom_weights or self.weights)

        scores: Dict[str, int] = {
            "text": max(0, min(100, text_score)),
        }

        if has_urls:
            scores["url"] = max(0, min(100, url_score))
        else:
            # If no URLs exist in message, do not dilute text score with 0
            active_weights.pop("url", None)

        # If transaction_score is provided and active weight > 0, include it
        if transaction_score is not None and active_weights.get("transaction", 0.0) > 0:
            scores["transaction"] = max(0, min(100, transaction_score))
        else:
            active_weights.pop("transaction", None)

        # Normalize weights
        total_weight = sum(active_weights[k] for k in scores if k in active_weights)
        if total_weight <= 0:
            total_weight = 1.0

        normalized_weights = {
            k: active_weights[k] / total_weight for k in scores if k in active_weights
        }

        # Calculate weighted overall score
        overall_score = sum(scores[k] * normalized_weights[k] for k in scores)
        overall_score = max(0.0, min(100.0, overall_score))

        verdict = self.compute_verdict(overall_score)
        confidence = self.compute_confidence(overall_score, scores)

        # Aggregate explanatory reasons
        combined_reasons: List[str] = []
        if text_reasons:
            combined_reasons.extend(text_reasons)
        if url_reasons:
            combined_reasons.extend(url_reasons)
        if transaction_reasons:
            combined_reasons.extend(transaction_reasons)

        unique_reasons = list(dict.fromkeys(combined_reasons))
        if not unique_reasons:
            if verdict == "Safe":
                unique_reasons.append("Low detected risk: Multi-modal scan identified no prominent scam or phishing indicators")
            elif verdict == "Suspicious":
                unique_reasons.append("Moderate risk: Minor risk indicators detected across active modalities")
            else:
                unique_reasons.append("High risk: Severe indicators detected in message and link structure")

        breakdown = {
            "modalities": scores,
            "weights_applied": {k: round(v, 3) for k, v in normalized_weights.items()},
            "formula": " + ".join([f"({scores[k]} * {normalized_weights[k]:.2f})" for k in scores]),
        }

        return FusionResult(
            overall_score=overall_score,
            verdict=verdict,
            confidence=confidence,
            breakdown=breakdown,
            reasons=unique_reasons,
        )


default_fusion_engine = FusionEngine()

def fuse_risk_scores(
    text_score: int,
    url_score: int,
    transaction_score: Optional[int] = None,
    text_reasons: Optional[List[str]] = None,
    url_reasons: Optional[List[str]] = None,
) -> FusionResult:
    """Convenience helper for standard 2-modality or 3-modality fusion."""
    return default_fusion_engine.fuse(
        text_score=text_score,
        url_score=url_score,
        transaction_score=transaction_score,
        text_reasons=text_reasons,
        url_reasons=url_reasons,
    )
