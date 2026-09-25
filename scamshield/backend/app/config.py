"""
ScamShield Centralized Configuration Module
Contains all thresholds, weights, heuristic point values, brand lists, and decision logic.
Operates strictly on a 0-100 scale with zero magic numbers in scoring modules.
All messaging uses calibrated "low detected risk" language (no "guaranteed safe" claims).
"""

from pathlib import Path
from typing import Dict, List, Set, Tuple
import os

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODELS_DIR / "classifier.pkl"
DB_PATH = Path(os.getenv("SCAMSHIELD_DB_PATH", str(BASE_DIR / "scam_reports.db")))

# -------------------------------------------------------------------------
# Risk Thresholds (0-100 Scale)
# Safe: < 40
# Suspicious: 40 - 74
# Dangerous: >= 75
# -------------------------------------------------------------------------
SAFE_THRESHOLD: int = 40
DANGEROUS_THRESHOLD: int = 75

SAFE_LABEL = "Safe"
SUSPICIOUS_LABEL = "Suspicious"
DANGEROUS_LABEL = "Dangerous"

def get_verdict(score: float | int) -> str:
    """
    Map a 0-100 risk score to its corresponding security verdict.
    - Safe: < 40 (Low detected risk)
    - Suspicious: 40 - 74 (Moderate risk indicators)
    - Dangerous: >= 75 (High confidence threat / phishing)
    """
    if score < SAFE_THRESHOLD:
        return SAFE_LABEL
    elif score < DANGEROUS_THRESHOLD:
        return SUSPICIOUS_LABEL
    else:
        return DANGEROUS_LABEL


# -------------------------------------------------------------------------
# Multi-Modal Fusion Weights Configuration (Default: 0.55 text / 0.45 url / 0.0 txn)
# -------------------------------------------------------------------------
TEXT_WEIGHT: float = 0.55
URL_WEIGHT: float = 0.45
TRANSACTION_WEIGHT: float = 0.0

DEFAULT_WEIGHTS: Dict[str, float] = {
    "text": TEXT_WEIGHT,
    "url": URL_WEIGHT,
    "transaction": TRANSACTION_WEIGHT,
}


# -------------------------------------------------------------------------
# Text Risk NLP & Heuristic Configuration
# -------------------------------------------------------------------------
ML_HEURISTIC_BLEND_THRESHOLD: int = 40
ML_WEIGHT_NORMAL: float = 0.65
RULE_WEIGHT_NORMAL: float = 0.35

# High risk regex patterns, explanations, and assigned risk points
HIGH_RISK_TEXT_PATTERNS: List[Tuple[str, str, int]] = [
    (r"\b(urgent|urgently|immediately|act now|hurry|final notice|immediate action|critical alert)\b", "High urgency language detected", 25),
    (r"\b(suspended|blocked|deactivated|frozen|terminated|locked|disabled)\b", "Account/card suspension threat detected", 30),
    (r"\b(verify|authenticate|update kyc|kyc verification|confirm identity|re-activate|reactivate)\b", "Credential/KYC verification solicitation", 25),
    (r"\b(lottery|won|winner|prize|reward|gift card|bonus \$?\d+|cash reward|sweepstakes)\b", "Unsolicited lottery/sweepstakes claim", 35),
    (r"\b(otp|pin|cvv|passcode|secret code|one time password)\b", "Request or reference to sensitive security tokens/OTP", 30),
    (r"\b(unauthorized|fraudulent|suspicious transaction|unrecognized activity|suspected fraud|withdrawal request|pending withdrawal)\b", "Fake fraud or unauthorized transfer alert", 30),
    (r"\b(arrest warrant|law enforcement|police|court summons|tax refund|irs|tax rebate)\b", "Authority impersonation / legal/tax refund threat", 35),
    (r"\b(crypto|bitcoin|btc|eth|doubler|guaranteed return|daily profit|investment scheme)\b", "Investment or crypto scam trigger", 30),
    (r"\b(part[- ]time job|work from home earn|salary \d+k? daily)\b", "Job scam trigger phrase", 25),
    (r"\b(click here|tap here|open link|download attachment|claim now|reschedule delivery|pay \$?\d+\.?\d* fee)\b", "Call-to-action or advance fee directive", 20),
]


# -------------------------------------------------------------------------
# URL Risk Lookalike & Domain Heuristics Configuration
# -------------------------------------------------------------------------
HIGH_RISK_TLDS: Set[str] = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "buzz", "fit", "icu",
    "work", "cn", "rest", "click", "surf", "casa", "fun", "monster",
    "vip", "cam", "bid", "racing", "date", "stream", "download", "link"
}

TARGET_BRANDS: List[str] = [
    "paypal", "chase", "bankofamerica", "bofa", "wellsfargo", "citibank",
    "amazon", "apple", "netflix", "microsoft", "google", "facebook",
    "instagram", "whatsapp", "telegram", "binance", "coinbase", "walmart",
    "sbi", "hdfc", "icici", "axisbank", "paytm", "phonepe", "gpay",
    "irs", "usps", "fedex", "dhl", "ups", "kraken", "metamask", "barclays",
    "ebay", "target"
]

SUSPICIOUS_PATH_KEYWORDS: List[str] = [
    "login", "signin", "verify", "secure", "update", "banking", "account",
    "wallet", "confirm", "claim", "reward", "kyc", "unlock", "passcode",
    "security-check", "billing", "authenticate", "session"
]

# URL Risk Point Allocations
URL_POINTS_IP_HOST: int = 50
URL_POINTS_HIGH_RISK_TLD: int = 40
URL_POINTS_BRAND_IMPERSONATION: int = 55
URL_POINTS_TYPOSQUATTING: int = 65
URL_POINTS_AT_SYMBOL: int = 50
URL_POINTS_EXCESSIVE_SUBDOMAINS: int = 20
URL_POINTS_SUSPICIOUS_PATH: int = 20


# -------------------------------------------------------------------------
# Transaction Risk Configuration & Rule Weights
# -------------------------------------------------------------------------
HIGH_RISK_PAYEE_PATTERNS: List[Tuple[str, str, int, str]] = [
    (r"\b(crypto|bitcoin|binance|eth|usdt|tron)\b", "Cryptocurrency transfer destination", 35, "High"),
    (r"\b(giftcard|voucher|applecard|steamcard|amazoncard)\b", "Gift card / non-refundable voucher payment", 40, "Critical"),
    (r"\b(escrow|lottery|lucky|prize|bonus|jackpot)\b", "Lottery/escrow scam beneficiary identifier", 40, "Critical"),
    (r"\b(quickpay|fastloan|instantcash|easyloan)\b", "Predatory loan / fast-cash service identifier", 25, "Medium"),
    (r"\b(p2p|unknown|temp|burner|cashier)\b", "P2P or ephemeral transaction endpoint", 20, "Medium"),
    (r"\b(agent|customs|officer|taxdept|police)\b", "Government/customs authority impersonation handle", 45, "Critical"),
]

SUSPICIOUS_NOTES_PATTERNS: List[Tuple[str, str, int, str]] = [
    (r"\b(urgent|immediate|quick transfer|hurry|asap)\b", "High urgency memo pressure", 15, "Low"),
    (r"\b(kyc|unlock|account unblock|fine payment|penalty|bail)\b", "Coerced extortion or fake compliance remark", 35, "High"),
    (r"\b(customs fee|processing fee|tax clearance|release fund)\b", "Advance-fee fraud indicator in memo", 35, "High"),
    (r"\b(double investment|trading profit|guaranteed payout)\b", "Investment pyramid memo indicator", 40, "Critical"),
]

SUSPICIOUS_ROUND_AMOUNTS: Set[float] = {
    9999.0, 10000.0, 20000.0, 25000.0, 49999.0, 50000.0, 99999.0, 100000.0
}

TRANSACTION_LARGE_AMOUNT_THRESHOLD: float = 50000.0
TRANSACTION_MODERATE_AMOUNT_THRESHOLD: float = 10000.0

TXN_POINTS_LARGE_FIRST_TIME: int = 35
TXN_POINTS_MODERATE_FIRST_TIME: int = 20
TXN_POINTS_NEW_PAYEE: int = 5
TXN_POINTS_ROUND_AMOUNT: int = 15
TXN_POINTS_IRREVERSIBLE_CHANNEL: int = 30
TXN_POINTS_ANOMALOUS_HOUR: int = 20

UNUSUAL_HOURS_START: int = 0
UNUSUAL_HOURS_END: int = 5  # 00:00 to 05:59 local/UTC
