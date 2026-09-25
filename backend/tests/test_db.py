"""
Unit tests for SQLite database operations in db.py
Includes tests for sensitive financial data sanitization (OTP, CVV, Card numbers).
"""

from app.db import Database, sanitize_sensitive_financial_data


def test_sanitize_sensitive_financial_data():
    # 1. Card number redaction
    raw_card = "Your refund is ready, enter card 4532 8901 2345 6789 to verify."
    clean_card = sanitize_sensitive_financial_data(raw_card)
    assert "4532 8901 2345 6789" not in clean_card
    assert "[REDACTED_CARD_NUMBER]" in clean_card

    # 2. CVV redaction
    raw_cvv = "Security check: enter CVV: 892 for validation"
    clean_cvv = sanitize_sensitive_financial_data(raw_cvv)
    assert "892" not in clean_cvv
    assert "[REDACTED_CVV]" in clean_cvv

    # 3. OTP redaction
    raw_otp = "Your authentication OTP is 482910, do not share it."
    clean_otp = sanitize_sensitive_financial_data(raw_otp)
    assert "482910" not in clean_otp
    assert "[REDACTED_OTP]" in clean_otp


def test_db_crud_and_stats(tmp_path):
    db_file = tmp_path / "test_scam.db"
    test_db = Database(db_path=db_file)

    # 1. Insert report with sensitive OTP and Card number to verify persistence sanitization
    report_id = test_db.insert_report(
        report_type="message",
        content="Urgent: Send card 4532 8901 2345 6789 and OTP: 987654 to unblock",
        sender="+1234567890",
        reason="Fake bank alert SMS with CVV 123",
        risk_score=85,
        reporter_email="user@example.com"
    )
    assert report_id is not None
    assert report_id >= 1

    # 2. Retrieve recent reports and verify data was redacted
    reports = test_db.get_recent_reports(limit=10)
    assert len(reports) == 1
    r = reports[0]
    assert r["id"] == report_id
    assert r["report_type"] == "message"
    assert "4532 8901 2345 6789" not in r["content"]
    assert "987654" not in r["content"]
    assert "123" not in r["reason"]
    assert "[REDACTED_CARD_NUMBER]" in r["content"]
    assert "[REDACTED_OTP]" in r["content"]
    assert "[REDACTED_CVV]" in r["reason"]

    # 3. Insert second report
    test_db.insert_report(
        report_type="transaction",
        content="Crypto payment request for visa unlock",
        reason="Advance fee fraud",
        risk_score=90
    )

    # 4. Check stats
    stats = test_db.get_stats()
    assert stats["total_reports"] == 2
    assert stats["dangerous_count"] == 2
    assert stats["safe_count"] == 0
