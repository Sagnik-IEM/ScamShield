"""
ScamShield Text Risk Scoring Module
Evaluates the scam and phishing risk of raw text content (SMS, email, chat).
Uses a TF-IDF + Logistic Regression ML classifier with calibrated feature extraction.

ZERO CROSS-IMPORTS:
Does not import url_risk, transaction_risk, or fusion.
Thresholds, weights, and rules are imported from app.config.
"""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional
import os
import re
import joblib

from app.config import (
    SAFE_THRESHOLD,
    DANGEROUS_THRESHOLD,
    HIGH_RISK_TEXT_PATTERNS,
    ML_HEURISTIC_BLEND_THRESHOLD,
    ML_WEIGHT_NORMAL,
    RULE_WEIGHT_NORMAL,
    MODEL_PATH,
    get_verdict,
)


@dataclass
class TextRiskResult:
    score: int  # 0 to 100
    label: str  # Safe, Suspicious, Dangerous
    reasons: List[str] = field(default_factory=list)
    top_features: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "score": self.score,
            "label": self.label,
            "reasons": self.reasons,
            "top_features": self.top_features,
        }


class TextRiskScorer:
    """
    Independent text scam risk classifier.
    Loads trained TF-IDF + LogisticRegression pipeline if available,
    with an intelligent fallback heuristic engine.
    """

    def __init__(self, model_path: Optional[str | Path] = None):
        self.model_path = Path(model_path) if model_path else MODEL_PATH
        self.model = None
        self._load_model()
        self.high_risk_patterns = HIGH_RISK_TEXT_PATTERNS

    def _load_model(self) -> None:
        """Attempt to load trained scikit-learn model artifact."""
        if self.model_path and self.model_path.exists():
            try:
                self.model = joblib.load(str(self.model_path))
            except Exception:
                self.model = None
        else:
            self.model = None

    def set_model(self, model: Any) -> None:
        """Allows injecting or reloading an in-memory trained model."""
        self.model = model

    def analyze(self, text: str) -> TextRiskResult:
        """
        Analyze input text and produce an integer risk score (0-100) and label.
        Uses calibrated 'low detected risk' language.
        """
        if not text or not text.strip():
            return TextRiskResult(
                score=0,
                label=get_verdict(0),
                reasons=["Low detected risk: Empty or blank message provided"]
            )

        clean_text = text.strip()
        lower_text = clean_text.lower()

        reasons: List[str] = []
        top_features: List[str] = []
        rule_score = 0

        # Run heuristic feature inspection for explainability
        for pattern, explanation, points in self.high_risk_patterns:
            matches = re.findall(pattern, lower_text, re.IGNORECASE)
            if matches:
                reasons.append(explanation)
                if isinstance(matches[0], tuple):
                    top_features.extend([m for m in matches[0] if m])
                else:
                    top_features.extend(matches)
                rule_score += points

        # If trained ML model is available, use predicted probability
        if self.model is not None:
            try:
                proba = self.model.predict_proba([clean_text])[0]
                scam_prob = float(proba[1]) if len(proba) > 1 else float(proba[0])
                ml_score = int(round(scam_prob * 100))

                # Combine ML score with strong heuristic signals if present
                if rule_score >= ML_HEURISTIC_BLEND_THRESHOLD:
                    final_score = max(ml_score, rule_score)
                else:
                    final_score = int(round(ML_WEIGHT_NORMAL * ml_score + RULE_WEIGHT_NORMAL * rule_score))
            except Exception:
                final_score = rule_score
        else:
            final_score = rule_score

        # Clamp between 0 and 100
        final_score = max(0, min(100, int(final_score)))
        label = get_verdict(final_score)

        if final_score < SAFE_THRESHOLD and not reasons:
            reasons.append("Low detected risk: No typical scam or phishing patterns identified in text")

        # Deduplicate features & reasons
        top_features = list(dict.fromkeys(top_features))[:8]
        reasons = list(dict.fromkeys(reasons))

        return TextRiskResult(
            score=final_score,
            label=label,
            reasons=reasons,
            top_features=top_features,
        )


# Global singleton instance for easy import
default_text_scorer = TextRiskScorer()

def score_text_risk(text: str) -> TextRiskResult:
    """Convenience function to score text risk using default scorer."""
    return default_text_scorer.analyze(text)
