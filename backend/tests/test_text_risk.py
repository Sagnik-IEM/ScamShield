"""
Unit tests for text_risk.py module
Verifies zero cross-imports, 0-100 score bounds, and phishing pattern triggers.
"""

import ast
from app.modules.text_risk import TextRiskScorer, score_text_risk, TextRiskResult


def test_zero_cross_imports():
    """Verify via AST that text_risk.py does NOT import url_risk, transaction_risk, or fusion."""
    import app.modules.text_risk as tr_module
    with open(tr_module.__file__, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read())
    
    forbidden = ["url_risk", "transaction_risk", "fusion"]
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                for fb in forbidden:
                    assert fb not in alias.name, f"Forbidden import: {alias.name}"
        elif isinstance(node, ast.ImportFrom):
            mod = node.module or ""
            for fb in forbidden:
                assert fb not in mod, f"Forbidden import from: {mod}"


def test_empty_and_benign_text():
    scorer = TextRiskScorer()
    res_empty = scorer.analyze("")
    assert res_empty.score == 0
    assert res_empty.label == "Safe"

    res_safe = scorer.analyze("Hey Dave, are we still having lunch at the cafeteria at 1 PM?")
    assert res_safe.score < 40
    assert res_safe.label == "Safe"


def test_high_risk_scam_text():
    scorer = TextRiskScorer()
    scam_msg = "CRITICAL ALERT: Your Bank of America debit card has been suspended due to suspected fraud. Re-activate immediately!"
    res = scorer.analyze(scam_msg)
    assert res.score >= 40
    assert res.label in ("Suspicious", "Dangerous")
    assert len(res.reasons) > 0
    assert any("threat" in r.lower() or "fraud" in r.lower() or "urgency" in r.lower() or "alert" in r.lower() for r in res.reasons)


def test_score_bounds_and_structure():
    res = score_text_risk("Congratulations! You won the $1,000,000 lottery sweepstakes!")
    assert isinstance(res, TextRiskResult)
    assert 0 <= res.score <= 100
    assert res.label in ("Safe", "Suspicious", "Dangerous")
    d = res.to_dict()
    assert "score" in d and "label" in d and "reasons" in d
