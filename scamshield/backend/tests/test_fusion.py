"""
Unit tests for fusion.py module
Verifies 0.55/0.45 weight combination, 86/94 -> 89.6 Dangerous verdict, extensible signature, and zero cross-imports.
"""

import ast
from app.modules.fusion import FusionEngine, fuse_risk_scores, FusionResult


def test_zero_cross_imports():
    """Verify via AST that fusion.py does NOT import text_risk, url_risk, or transaction_risk."""
    import app.modules.fusion as fusion_module
    with open(fusion_module.__file__, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read())
    
    forbidden = ["text_risk", "url_risk", "transaction_risk"]
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                for fb in forbidden:
                    assert fb not in alias.name, f"Forbidden import: {alias.name}"
        elif isinstance(node, ast.ImportFrom):
            mod = node.module or ""
            for fb in forbidden:
                assert fb not in mod, f"Forbidden import from: {mod}"


def test_fusion_signature_and_weights():
    engine = FusionEngine()

    # fuse() only requires text_score and url_score as arguments
    res = engine.fuse(text_score=86, url_score=94)
    assert round(res.overall_score, 1) == 89.6
    assert res.verdict == "Dangerous"
    assert 0.0 <= res.confidence <= 1.0


def test_fusion_safe_and_suspicious_verdicts():
    engine = FusionEngine()

    # Safe test: 20 text, 10 url -> 0.55*20 + 0.45*10 = 11 + 4.5 = 15.5 (< 40)
    res_safe = engine.fuse(text_score=20, url_score=10)
    assert res_safe.overall_score == 15.5
    assert res_safe.verdict == "Safe"

    # Suspicious test: 50 text, 60 url -> 0.55*50 + 0.45*60 = 27.5 + 27 = 54.5 (40-74)
    res_susp = engine.fuse(text_score=50, url_score=60)
    assert res_susp.overall_score == 54.5
    assert res_susp.verdict == "Suspicious"


def test_extensibility_with_third_weight():
    engine = FusionEngine()
    # If custom weights add transaction modality:
    custom_weights = {"text": 0.40, "url": 0.30, "transaction": 0.30}
    res = engine.fuse(
        text_score=80,
        url_score=70,
        transaction_score=90,
        custom_weights=custom_weights,
    )
    # Expected: 0.40*80 + 0.30*70 + 0.30*90 = 32 + 21 + 27 = 80.0
    assert round(res.overall_score, 1) == 80.0
    assert res.verdict == "Dangerous"
