"""
ScamShield Database Module
Lightweight SQLite persistence for community scam reports and threat intelligence.
Enforces strict sensitive financial data sanitization (redacting OTPs, PINs, CVVs, card numbers).
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import os
import re
import sqlite3

# Default DB Path
DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent / "scam_reports.db"


def sanitize_sensitive_financial_data(text: str) -> str:
    """
    Strips and redacts sensitive financial information (credit card numbers, CVVs, OTPs, PINs)
    to prevent sensitive data leakage or persistence in community reports and logs.
    """
    if not text:
        return ""

    sanitized = text

    # 1. Mask 13-19 digit card numbers (Visa, Mastercard, Amex, Discover, etc.)
    sanitized = re.sub(
        r"\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|[0-9]{4}[ -][0-9]{4}[ -][0-9]{4}[ -][0-9]{1,4})\b",
        "[REDACTED_CARD_NUMBER]",
        sanitized
    )

    # 2. Mask CVV / CVC (3-4 digits preceded by CVV/CVC keywords)
    sanitized = re.sub(
        r"(?i)\b(cvv2?|cvc2?|security code|card verification value)(?:\s+(?:is|code|number|value))?[\s:=#\-]*([0-9]{3,4})\b",
        r"\1 [REDACTED_CVV]",
        sanitized
    )

    # 3. Mask OTP / Verification PINs (4-8 digits preceded by OTP/PIN keywords)
    sanitized = re.sub(
        r"(?i)\b(otp|one[- ]time[- ]password|pin|passcode|secret code)(?:\s+(?:is|code|number))?[\s:=#\-]*([0-9]{4,8})\b",
        r"\1 [REDACTED_OTP]",
        sanitized
    )

    return sanitized


class Database:
    def __init__(self, db_path: Optional[Path | str] = None):
        self.db_path = Path(db_path or os.getenv("SCAMSHIELD_DB_PATH", str(DEFAULT_DB_PATH)))
        self.init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self) -> None:
        """Create tables and indexes if they do not exist."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scam_reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    report_type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    sender TEXT,
                    reason TEXT NOT NULL,
                    risk_score INTEGER,
                    reporter_email TEXT,
                    status TEXT DEFAULT 'pending_review',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_scam_reports_created 
                ON scam_reports (created_at DESC)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_scam_reports_type 
                ON scam_reports (report_type)
            """)
            conn.commit()

    def insert_report(
        self,
        report_type: str,
        content: str,
        reason: str,
        sender: Optional[str] = None,
        reporter_email: Optional[str] = None,
        risk_score: Optional[int] = None,
    ) -> int:
        """
        Sanitizes sensitive financial data and inserts a newly submitted scam report.
        Returns newly created report ID.
        """
        clean_content = sanitize_sensitive_financial_data(content)
        clean_reason = sanitize_sensitive_financial_data(reason)
        clean_sender = sanitize_sensitive_financial_data(sender) if sender else None

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO scam_reports (report_type, content, sender, reason, risk_score, reporter_email, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                report_type,
                clean_content,
                clean_sender,
                clean_reason,
                risk_score,
                reporter_email,
                datetime.now(timezone.utc).isoformat()
            ))
            conn.commit()
            return cursor.lastrowid

    def get_recent_reports(self, limit: int = 50, report_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve latest scam reports for community feed."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if report_type:
                cursor.execute("""
                    SELECT id, report_type, content, sender, reason, risk_score, status, created_at
                    FROM scam_reports
                    WHERE report_type = ?
                    ORDER BY created_at DESC
                    LIMIT ?
                """, (report_type, limit))
            else:
                cursor.execute("""
                    SELECT id, report_type, content, sender, reason, risk_score, status, created_at
                    FROM scam_reports
                    ORDER BY created_at DESC
                    LIMIT ?
                """, (limit,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_stats(self) -> Dict[str, Any]:
        """Aggregate report statistics for analytics display."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM scam_reports")
            total = cursor.fetchone()[0]

            cursor.execute("SELECT report_type, COUNT(*) FROM scam_reports GROUP BY report_type")
            by_type = dict(cursor.fetchall())

            cursor.execute("""
                SELECT 
                    SUM(CASE WHEN risk_score < 40 THEN 1 ELSE 0 END) as safe_cnt,
                    SUM(CASE WHEN risk_score >= 40 AND risk_score < 75 THEN 1 ELSE 0 END) as susp_cnt,
                    SUM(CASE WHEN risk_score >= 75 THEN 1 ELSE 0 END) as dang_cnt
                FROM scam_reports
            """)
            row = cursor.fetchone()
            return {
                "total_reports": total,
                "safe_count": row[0] or 0,
                "suspicious_count": row[1] or 0,
                "dangerous_count": row[2] or 0,
                "top_scam_types": by_type,
            }


# Global singleton instance
db = Database()
