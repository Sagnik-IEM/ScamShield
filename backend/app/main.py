"""
ScamShield FastAPI Main Application
Exposes REST endpoints for real-time scam message scanning, transaction fraud evaluation,
and community threat intelligence reporting.
Includes full CORS support and comprehensive OpenAPI specification contract (/docs).
"""

from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_verdict, DB_PATH
from app.db import db
from app.modules.fusion import default_fusion_engine, fuse_risk_scores
from app.modules.text_risk import score_text_risk
from app.modules.transaction_risk import score_transaction_risk
from app.modules.url_risk import score_url_risk
from app.schemas import (
    CheckMessageRequest,
    CheckMessageResponse,
    CheckTransactionRequest,
    CheckTransactionResponse,
    DomainDetail,
    ReportScamRequest,
    ReportScamResponse,
    ScamReportItem,
    StatsResponse,
    TextRiskDetail,
    TransactionRiskFactor,
    UrlRiskDetail,
)

app = FastAPI(
    title="ScamShield API",
    description=(
        "Production-grade Multi-Modal Scam & Fraud Intelligence Engine. "
        "Provides decoupled risk-scoring endpoints for text analysis (NLP), "
        "lookalike URL heuristics, transaction fraud detection, and multi-modal score fusion."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# -------------------------------------------------------------------------
# CORS Middleware: Configured for external React/Flutter frontend apps
# -------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint confirming engine readiness and database connectivity."""
    return {
        "status": "healthy",
        "service": "ScamShield Security Engine",
        "version": "1.0.0",
        "database": "connected" if DB_PATH.exists() else "initialized",
    }


@app.post(
    "/check-message",
    response_model=CheckMessageResponse,
    tags=["Scanners"],
    summary="Scan message and embedded links for phishing/scam risk"
)
def check_message(payload: CheckMessageRequest) -> CheckMessageResponse:
    """
    Scans a text message, SMS, or email.
    Fans out to `text_risk` (TF-IDF + LogReg ML) and `url_risk` (lookalike heuristics),
    then fuses the modality outputs (0.55 / 0.45) into a final verdict on a 0-100 scale.
    """
    message_text = payload.message.strip()
    if not message_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message text must not be empty.",
        )

    # 1. Independent Text Risk Scoring (0-100)
    text_result = score_text_risk(message_text)

    # 2. Independent URL Risk Scoring (0-100)
    target_urls = payload.urls if payload.urls is not None else message_text
    url_result = score_url_risk(target_urls)

    has_detected_urls = len(url_result.extracted_urls) > 0

    # 3. Extensible Multi-Modal Fusion Engine
    fused_result = default_fusion_engine.fuse(
        text_score=text_result.score,
        url_score=url_result.score,
        has_urls=has_detected_urls,
        text_reasons=text_result.reasons,
        url_reasons=url_result.reasons,
    )

    # Format domain details
    domain_detail_models = [
        DomainDetail(
            url=d.url,
            domain=d.domain,
            is_lookalike=d.is_lookalike,
            target_brand=d.target_brand,
            levenshtein_distance=d.levenshtein_distance,
            high_risk_tld=d.high_risk_tld,
            has_ip_host=d.has_ip_host,
            suspicious_path_detected=d.suspicious_path_detected,
            score=d.score,
            reasons=d.reasons,
        )
        for d in url_result.domain_details
    ]

    return CheckMessageResponse(
        verdict=fused_result.verdict,
        overall_score=round(fused_result.overall_score, 2),
        confidence=round(fused_result.confidence, 3),
        text_risk=TextRiskDetail(
            score=text_result.score,
            label=text_result.label,
            reasons=text_result.reasons,
            top_features=text_result.top_features,
        ),
        url_risk=UrlRiskDetail(
            score=url_result.score,
            label=url_result.label,
            reasons=url_result.reasons,
            extracted_urls=url_result.extracted_urls,
            domain_details=domain_detail_models,
        ),
        reasons=fused_result.reasons,
    )


@app.post(
    "/check-transaction",
    response_model=CheckTransactionResponse,
    tags=["Scanners"],
    summary="Evaluate transaction fraud and anomalous payment patterns"
)
def check_transaction(payload: CheckTransactionRequest) -> CheckTransactionResponse:
    """
    Evaluates transaction fraud indicators (payee risk, amount velocity, time anomalies, memo cues).
    Produces an independent verdict on a 0-100 scale.
    """
    res = score_transaction_risk(
        payee=payload.payee,
        amount=payload.amount,
        timestamp=payload.timestamp,
        account_type=payload.account_type,
        is_first_time=payload.is_first_time,
        notes=payload.notes,
    )

    factors_models = [
        TransactionRiskFactor(
            factor=f.factor,
            severity=f.severity,
            description=f.description,
            points_added=f.points_added,
        )
        for f in res.risk_factors
    ]

    return CheckTransactionResponse(
        verdict=res.label,
        risk_score=res.score,
        reasons=res.reasons,
        risk_factors=factors_models,
    )


@app.post(
    "/report-scam",
    response_model=ReportScamResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Community Reports"],
    summary="Submit a newly identified scam or fraudulent activity"
)
def report_scam(payload: ReportScamRequest) -> ReportScamResponse:
    """
    Persists user-flagged scam text, URL, or suspicious transaction to community SQLite DB.
    """
    report_id = db.insert_report(
        report_type=payload.report_type,
        content=payload.content,
        sender=payload.sender,
        reason=payload.reported_reason,
        reporter_email=payload.reporter_email,
        risk_score=payload.risk_score_at_report,
    )

    from datetime import datetime, timezone
    return ReportScamResponse(
        report_id=report_id,
        status="success",
        message="Scam report successfully logged to community threat intelligence DB.",
        created_at=datetime.now(timezone.utc).isoformat(),
    )


@app.get(
    "/reports",
    response_model=List[ScamReportItem],
    tags=["Community Reports"],
    summary="List community reported scams with optional category filter"
)
def get_reports(
    limit: int = Query(default=50, ge=1, le=200, description="Max number of reports to return"),
    report_type: Optional[str] = Query(default=None, description="Filter by report type (message, url, transaction)")
) -> List[ScamReportItem]:
    """Retrieve list of community reported scams."""
    records = db.get_recent_reports(limit=limit, report_type=report_type)
    return [
        ScamReportItem(
            id=r["id"],
            report_type=r["report_type"],
            content=r["content"],
            sender=r["sender"],
            reason=r["reason"],
            risk_score=r["risk_score"],
            created_at=str(r["created_at"]),
        )
        for r in records
    ]


@app.get(
    "/stats",
    response_model=StatsResponse,
    tags=["Analytics"],
    summary="Global fraud statistics and threat distribution metrics"
)
def get_stats() -> StatsResponse:
    """Retrieve global scam report and protection statistics."""
    stats_data = db.get_stats()
    return StatsResponse(
        total_reports=stats_data["total_reports"],
        safe_count=stats_data["safe_count"],
        suspicious_count=stats_data["suspicious_count"],
        dangerous_count=stats_data["dangerous_count"],
        top_scam_types=stats_data["top_scam_types"],
    )


# -------------------------------------------------------------------------
# Internal Dev Test Harness Mounting (backend/dev-preview)
# -------------------------------------------------------------------------
dev_preview_dir = Path(__file__).resolve().parent.parent / "dev-preview"
if dev_preview_dir.exists():
    app.mount("/dev-preview", StaticFiles(directory=str(dev_preview_dir)), name="dev-preview")

    @app.get("/", include_in_schema=False)
    def root_endpoint():
        return {
            "service": "ScamShield API",
            "status": "running",
            "docs": "/docs",
            "openapi": "/openapi.json",
            "internal_dev_harness": "/dev-preview/index.html"
        }
