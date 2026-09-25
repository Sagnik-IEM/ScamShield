"""
Unit tests for ScamShield config.py
Verifies 0-100 scale thresholds and verdict boundary mappings.
"""

import pytest
from app.config import (
    SAFE_THRESHOLD,
    DANGEROUS_THRESHOLD,
    DEFAULT_WEIGHTS,
    TEXT_WEIGHT,
    URL_WEIGHT,
    TRANSACTION_WEIGHT,
    get_verdict,
)


def test_threshold_constants():
    assert SAFE_THRESHOLD == 40
    assert DANGEROUS_THRESHOLD == 75
    assert TEXT_WEIGHT == 0.55
    assert URL_WEIGHT == 0.45
    assert TRANSACTION_WEIGHT == 0.0
    assert DEFAULT_WEIGHTS["text"] == 0.55
    assert DEFAULT_WEIGHTS["url"] == 0.45


def test_verdict_boundaries():
    # Safe: < 40
    assert get_verdict(0) == "Safe"
    assert get_verdict(25) == "Safe"
    assert get_verdict(39) == "Safe"
    assert get_verdict(39.9) == "Safe"

    # Suspicious: 40 - 74
    assert get_verdict(40) == "Suspicious"
    assert get_verdict(50) == "Suspicious"
    assert get_verdict(74) == "Suspicious"
    assert get_verdict(74.9) == "Suspicious"

    # Dangerous: >= 75
    assert get_verdict(75) == "Dangerous"
    assert get_verdict(89.6) == "Dangerous"
    assert get_verdict(100) == "Dangerous"


def test_weighted_fusion_formula():
    text_score = 86
    url_score = 94
    weighted = (TEXT_WEIGHT * text_score) + (URL_WEIGHT * url_score)
    assert round(weighted, 1) == 89.6
    assert get_verdict(weighted) == "Dangerous"
