"""
Unit tests for transaction_risk.py module
Verifies payee risk, first-time large amount alerts, anomalous hours, and zero cross-imports.
"""

import ast
from app.modules.transaction_risk import (
    TransactionRiskScorer,
    score_transaction_risk,
    TransactionRiskResult,
)


def test_zero_cross_imports():
    """Verify via AST that transaction_risk.py does NOT import text_risk, url_risk, or fusion."""
    import app.modules.transaction_risk as tx_module
    with open(tx_module.__file__, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read())
    
    forbidden = ["text_risk", "url_risk", "fusion"]
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                for fb in forbidden:
                    assert fb not in alias.name, f"Forbidden import: {alias.name}"
        elif isinstance(node, ast.ImportFrom):
            mod = node.module or ""
            for fb in forbidden:
                assert fb not in mod, f"Forbidden import from: {mod}"


def test_safe_transaction():
    scorer = TransactionRiskScorer()
    res = scorer.analyze(
        payee="trusted_grocery_store",
        amount=45.50,
        timestamp="2026-09-25T14:30:00",
        account_type="upi",
        is_first_time=False,
        notes="Weekly grocery items"
    )
    assert res.score < 40
    assert res.label == "Safe"


def test_high_risk_crypto_and_large_amount():
    scorer = TransactionRiskScorer()
    res = scorer.analyze(
        payee="crypto_escrow_agent_99",
        amount=50000.0,
        timestamp="2026-09-25T03:15:00",  # 3 AM anomalous hour
        account_type="crypto",
        is_first_time=True,
        notes="Urgent customs clearance fee and kyc unlock"
    )
    assert res.score >= 75
    assert res.label == "Dangerous"
    assert len(res.risk_factors) >= 3
    assert any("crypto" in f.description.lower() for f in res.risk_factors)
    assert any("hour" in f.description.lower() or "late-night" in f.factor.lower() for f in res.risk_factors)


def test_score_bounds_and_structure():
    res = score_transaction_risk(payee="lottery_winner_payout", amount=9999.0)
    assert isinstance(res, TransactionRiskResult)
    assert 0 <= res.score <= 100
    assert res.label in ("Safe", "Suspicious", "Dangerous")
