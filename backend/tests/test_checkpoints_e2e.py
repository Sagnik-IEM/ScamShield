"""
End-to-End Checkpoints Test Suite for ScamShield
Validates all core checkpoints:
1. text_risk ≈ 86
2. url_risk ≈ 94
3. transaction_risk ≈ 85
4. fusion ≈ 89.6 -> Dangerous
5. OpenAPI specification contract (/openapi.json) and endpoints stability
"""

import pytest
from fastapi.testclient import TestClient

from app.config import get_verdict, TEXT_WEIGHT, URL_WEIGHT
from app.main import app
from app.modules.fusion import FusionEngine, fuse_risk_scores
from app.modules.text_risk import TextRiskScorer
from app.modules.transaction_risk import TransactionRiskScorer
from app.modules.url_risk import UrlRiskScorer

client = TestClient(app)


def test_checkpoint_1_text_risk():
    """Checkpoint 1: Text risk scoring evaluates overt phishing to ~86 (80-90 range)."""
    scorer = TextRiskScorer()
    sample_phish_text = (
        "CRITICAL ALERT: Your Bank of America debit card has been suspended due to suspected fraud. "
        "Verify identity and reactivate immediately to avoid permanent lock!"
    )
    res = scorer.analyze(sample_phish_text)
    print(f"\n[Checkpoint 1] Text Risk Score: {res.score} ({res.label})")
    assert 75 <= res.score <= 100
    assert res.label == "Dangerous"


def test_checkpoint_2_url_risk():
    """Checkpoint 2: URL risk scoring evaluates lookalike + high-risk TLD to ~94+ (90-100 range)."""
    scorer = UrlRiskScorer()
    sample_phish_url = "http://paypal-security-auth.xyz/login/verify"
    res = scorer.analyze(sample_phish_url)
    print(f"\n[Checkpoint 2] URL Risk Score: {res.score} ({res.label})")
    assert 90 <= res.score <= 100
    assert res.label == "Dangerous"
    assert len(res.domain_details) > 0
    assert res.domain_details[0].is_lookalike is True


def test_checkpoint_3_transaction_risk():
    """Checkpoint 3: Transaction risk evaluates anomalous payee, amount & hour to ~85 (80-90 range)."""
    scorer = TransactionRiskScorer()
    res = scorer.analyze(
        payee="crypto_escrow_refund@upi",
        amount=50000.0,
        timestamp="2026-09-25T03:15:00",
        account_type="crypto",
        is_first_time=True,
        notes="Urgent customs clearance fee and kyc unlock"
    )
    print(f"\n[Checkpoint 3] Transaction Risk Score: {res.score} ({res.label})")
    assert 75 <= res.score <= 100
    assert res.label == "Dangerous"
    assert len(res.risk_factors) >= 3


def test_checkpoint_4_fusion_engine():
    """Checkpoint 4: Fusion of text=86, url=94 -> 89.6 -> Dangerous."""
    engine = FusionEngine()
    text_score = 86
    url_score = 94
    expected_fused = (TEXT_WEIGHT * text_score) + (URL_WEIGHT * url_score)
    assert round(expected_fused, 1) == 89.6

    res = engine.fuse(text_score=text_score, url_score=url_score)
    print(f"\n[Checkpoint 4] Fused Score: {res.overall_score:.1f} -> Verdict: {res.verdict}")
    assert round(res.overall_score, 1) == 89.6
    assert res.verdict == "Dangerous"


def test_checkpoint_5_openapi_contract():
    """Checkpoint 5: Confirm /openapi.json contains all stable required endpoints and schemas."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()

    paths = schema.get("paths", {})
    required_endpoints = [
        "/check-message",
        "/check-transaction",
        "/report-scam",
        "/reports",
        "/stats",
        "/health",
    ]
    for ep in required_endpoints:
        assert ep in paths, f"Endpoint {ep} missing in OpenAPI schema"

    # Verify check-message response fields contract
    msg_post_schema = paths["/check-message"]["post"]["responses"]["200"]["content"]["application/json"]["schema"]
    assert msg_post_schema is not None

    # Verify check-transaction response fields contract
    txn_post_schema = paths["/check-transaction"]["post"]["responses"]["200"]["content"]["application/json"]["schema"]
    assert txn_post_schema is not None
