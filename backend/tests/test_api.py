"""
Integration tests for FastAPI endpoints in main.py
Tests /health, /check-message, /check-transaction, /report-scam, /reports, /stats.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_check_message_safe():
    response = client.post("/check-message", json={
        "message": "Hey Sarah, let's meet for lunch at 12:30 PM today."
    })
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "Safe"
    assert data["overall_score"] < 40
    assert "text_risk" in data
    assert "url_risk" in data


def test_check_message_dangerous():
    response = client.post("/check-message", json={
        "message": "URGENT: Your Chase account is locked. Verify at http://chase-security-verify.xyz/login immediately!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "Dangerous"
    assert data["overall_score"] >= 75
    assert len(data["reasons"]) > 0
    assert len(data["url_risk"]["domain_details"]) > 0


def test_check_transaction():
    response = client.post("/check-transaction", json={
        "payee": "instant_crypto_bonus_agent",
        "amount": 50000.0,
        "account_type": "crypto",
        "is_first_time": True,
        "notes": "Urgent custom clearance fee"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "Dangerous"
    assert data["risk_score"] >= 75
    assert len(data["risk_factors"]) > 0


def test_report_scam_and_retrieval():
    # Submit report
    rep_resp = client.post("/report-scam", json={
        "report_type": "message",
        "content": "Won $500,000 lottery text message",
        "sender": "+18005550199",
        "reported_reason": "Fake sweepstakes lottery scam",
        "risk_score_at_report": 92
    })
    assert rep_resp.status_code == 201
    rep_data = rep_resp.json()
    assert rep_data["status"] == "success"
    assert "report_id" in rep_data

    # List reports
    list_resp = client.get("/reports?limit=10")
    assert list_resp.status_code == 200
    reports = list_resp.json()
    assert len(reports) >= 1

    # Stats
    stats_resp = client.get("/stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert stats["total_reports"] >= 1
