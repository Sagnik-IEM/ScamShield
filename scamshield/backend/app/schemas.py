"""
ScamShield Pydantic Schemas
Defines request and response data models for message checking, transaction scoring,
and community scam reporting.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# -------------------------------------------------------------------------
# Message Risk Schemas
# -------------------------------------------------------------------------
class CheckMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Raw text message, email, or SMS content to scan")
    urls: Optional[List[str]] = Field(default=None, description="Explicit list of URLs (optional; extracted if empty)")


class TextRiskDetail(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Text risk score from 0 to 100")
    label: str = Field(..., description="Risk label: Safe, Suspicious, or Dangerous")
    reasons: List[str] = Field(default_factory=list, description="Explanatory indicators detected in text")
    top_features: List[str] = Field(default_factory=list, description="Key high-risk token or trigger matches")


class DomainDetail(BaseModel):
    url: str
    domain: str
    is_lookalike: bool = False
    target_brand: Optional[str] = None
    levenshtein_distance: Optional[int] = None
    high_risk_tld: bool = False
    has_ip_host: bool = False
    suspicious_path_detected: bool = False
    score: int = 0
    reasons: List[str] = Field(default_factory=list)


class UrlRiskDetail(BaseModel):
    score: int = Field(..., ge=0, le=100, description="URL risk score from 0 to 100")
    label: str = Field(..., description="Risk label: Safe, Suspicious, or Dangerous")
    reasons: List[str] = Field(default_factory=list, description="Explanatory indicators detected in URLs")
    extracted_urls: List[str] = Field(default_factory=list, description="All URLs extracted from payload")
    domain_details: List[DomainDetail] = Field(default_factory=list, description="Granular per-domain analysis")


class CheckMessageResponse(BaseModel):
    verdict: str = Field(..., description="Final fused verdict: Safe, Suspicious, or Dangerous")
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Weighted fused risk score from 0.0 to 100.0")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence metric from 0.0 to 1.0")
    text_risk: TextRiskDetail = Field(..., description="Detailed breakdown from text risk module")
    url_risk: UrlRiskDetail = Field(..., description="Detailed breakdown from URL risk module")
    reasons: List[str] = Field(default_factory=list, description="Aggregated explainability reasons")


# -------------------------------------------------------------------------
# Transaction Risk Schemas
# -------------------------------------------------------------------------
class CheckTransactionRequest(BaseModel):
    payee: str = Field(..., min_length=1, description="Payee VPA, UPI ID, account number, or name")
    amount: float = Field(..., gt=0.0, description="Transaction monetary amount")
    timestamp: Optional[str] = Field(default=None, description="ISO-8601 timestamp (defaults to current time if omitted)")
    account_type: Optional[str] = Field(default="upi", description="Payment channel: upi, bank_transfer, crypto, card")
    is_first_time: bool = Field(default=True, description="Whether this is a first-time transfer to this recipient")
    notes: Optional[str] = Field(default=None, description="Payment remarks, memo, or invoice description")


class TransactionRiskFactor(BaseModel):
    factor: str = Field(..., description="Risk factor name")
    severity: str = Field(..., description="Severity level: Low, Medium, High, Critical")
    description: str = Field(..., description="Human-readable explanation of risk trigger")
    points_added: int = Field(..., ge=0, le=100, description="Score contribution")


class CheckTransactionResponse(BaseModel):
    verdict: str = Field(..., description="Independent verdict: Safe, Suspicious, or Dangerous")
    risk_score: int = Field(..., ge=0, le=100, description="Integer transaction risk score 0 to 100")
    reasons: List[str] = Field(default_factory=list, description="Primary flags detected")
    risk_factors: List[TransactionRiskFactor] = Field(default_factory=list, description="Granular factor points")


# -------------------------------------------------------------------------
# Community Scam Reporting Schemas
# -------------------------------------------------------------------------
class ReportScamRequest(BaseModel):
    report_type: str = Field(..., description="Category: message, url, transaction, other")
    content: str = Field(..., min_length=3, description="Suspicious text, URL, or payment reference")
    sender: Optional[str] = Field(default=None, description="Sender phone, handle, email, or UPI ID")
    reported_reason: str = Field(..., min_length=3, description="User explanation of why this was a scam")
    reporter_email: Optional[str] = Field(default=None, description="Optional reporter contact")
    risk_score_at_report: Optional[int] = Field(default=None, ge=0, le=100, description="Risk score when scanned")


class ReportScamResponse(BaseModel):
    report_id: int = Field(..., description="Assigned database ID for report")
    status: str = Field(..., description="Success status")
    message: str = Field(..., description="Confirmation message")
    created_at: str = Field(..., description="ISO creation timestamp")


class ScamReportItem(BaseModel):
    id: int
    report_type: str
    content: str
    sender: Optional[str] = None
    reason: str
    risk_score: Optional[int] = None
    created_at: str


class StatsResponse(BaseModel):
    total_reports: int
    safe_count: int
    suspicious_count: int
    dangerous_count: int
    top_scam_types: Dict[str, int]
