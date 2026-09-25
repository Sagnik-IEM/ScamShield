# ScamShield API Contract Specification (v1.0.0)

This document specifies the exact, stable REST API contract for the ScamShield backend.
Interactive Swagger documentation is available at `http://localhost:8000/docs` (`/openapi.json`).

> [!NOTE]
> **Frontend Integration Note:**
> The `backend/dev-preview/` folder contains an internal test harness only. The official deliverable frontend is being built separately against the contract below.
> 
> CORS is globally enabled (`allow_origins=["*"]`) with credentials and all methods allowed.

---

## 1. Decision Boundaries (0–100 Scale)

All scoring endpoints return calibrated integer/float risk scores mapped to three security verdicts:
- **`Safe`**: Score $< 40$ *(Low detected risk)*
- **`Suspicious`**: $40 \le \text{Score} \le 74$ *(Moderate risk)*
- **`Dangerous`**: $\text{Score} \ge 75$ *(High risk alert)*

---

## 2. Endpoints Reference

### `POST /check-message`
Scans text messages (SMS, WhatsApp, emails) and URLs. Fans out to text NLP classifier and URL lookalike heuristics, combining them via weighted fusion ($0.55 \text{ Text} + 0.45 \text{ URL}$).

**Request Body (`application/json`):**
```json
{
  "message": "URGENT: Your Chase checking account is suspended. Verify at http://chase-verify.xyz/login immediately!",
  "urls": ["http://chase-verify.xyz/login"]
}
```
*(Note: `urls` is optional; URLs will be automatically extracted from `message` if omitted).*

**Response Body (HTTP 200):**
```json
{
  "verdict": "Dangerous",
  "overall_score": 89.0,
  "confidence": 0.81,
  "text_risk": {
    "score": 80,
    "label": "Dangerous",
    "reasons": [
      "High urgency language detected",
      "Account/card suspension threat detected",
      "Credential/KYC verification solicitation"
    ],
    "top_features": ["urgent", "suspended", "verify"]
  },
  "url_risk": {
    "score": 100,
    "label": "Dangerous",
    "reasons": [
      "High-risk, abuse-prone top-level domain detected (.xyz)",
      "Domain impersonates legitimate brand 'chase' (chase-verify)",
      "Sensitive credential/banking path keyword detected: login"
    ],
    "extracted_urls": ["http://chase-verify.xyz/login"],
    "domain_details": [
      {
        "url": "http://chase-verify.xyz/login",
        "domain": "chase-verify.xyz",
        "is_lookalike": true,
        "target_brand": "chase",
        "levenshtein_distance": null,
        "high_risk_tld": true,
        "has_ip_host": false,
        "suspicious_path_detected": true,
        "score": 100,
        "reasons": [
          "High-risk, abuse-prone top-level domain detected (.xyz)",
          "Domain impersonates legitimate brand 'chase' (chase-verify)",
          "Sensitive credential/banking path keyword detected: login"
        ]
      }
    ]
  },
  "reasons": [
    "High urgency language detected",
    "Account/card suspension threat detected",
    "Credential/KYC verification solicitation",
    "High-risk, abuse-prone top-level domain detected (.xyz)",
    "Domain impersonates legitimate brand 'chase' (chase-verify)",
    "Sensitive credential/banking path keyword detected: login"
  ]
}
```

---

### `POST /check-transaction`
Evaluates financial transaction fraud signals (payee risk, large first-time transfers, unusual late-night hours, memo triggers). Produces an independent verdict.

**Request Body (`application/json`):**
```json
{
  "payee": "crypto_escrow_refund@upi",
  "amount": 50000.0,
  "timestamp": "2026-09-25T03:15:00",
  "account_type": "crypto",
  "is_first_time": true,
  "notes": "Urgent customs clearance fee and kyc unlock"
}
```

**Response Body (HTTP 200):**
```json
{
  "verdict": "Dangerous",
  "risk_score": 80,
  "reasons": [
    "Cryptocurrency transfer destination",
    "Lottery/escrow scam beneficiary identifier",
    "High amount transferred to a first-time payee",
    "High risk payment channel (crypto)",
    "Transaction initiated during anomalous late-night hours",
    "High urgency memo pressure",
    "Coerced extortion or fake compliance remark",
    "Advance-fee fraud indicator in memo"
  ],
  "risk_factors": [
    {
      "factor": "High-Risk Payee Keyword",
      "severity": "High",
      "description": "Cryptocurrency transfer destination",
      "points_added": 35
    },
    {
      "factor": "Large First-Time Transfer",
      "severity": "High",
      "description": "High monetary value (> 50,000 USD / INR) sent to an unverified first-time recipient",
      "points_added": 35
    },
    {
      "factor": "Irreversible Payment Channel",
      "severity": "High",
      "description": "Channel 'crypto' offers zero fraud chargeback or escrow recovery",
      "points_added": 30
    }
  ]
}
```

---

### `POST /report-scam`
Logs user-flagged scam text, malicious URLs, or payment handles into the SQLite threat intelligence database. Automatically redacts any sensitive card numbers, OTPs, or CVVs.

**Request Body (`application/json`):**
```json
{
  "report_type": "message",
  "content": "Won $500,000 lottery promo SMS",
  "sender": "+18005550199",
  "reported_reason": "Fake sweepstakes lottery scam requesting advance fee",
  "reporter_email": "user@example.com",
  "risk_score_at_report": 92
}
```

**Response Body (HTTP 201 Created):**
```json
{
  "report_id": 1,
  "status": "success",
  "message": "Scam report successfully logged to community threat intelligence DB.",
  "created_at": "2026-09-25T15:54:30.000000+00:00"
}
```

---

### `GET /reports`
Retrieves recent community scam reports with optional filtering.

**Query Parameters:**
- `limit` (integer, default: 50, range: 1–200)
- `report_type` (string, optional: `message`, `url`, `transaction`, `other`)

**Response Body (HTTP 200):**
```json
[
  {
    "id": 1,
    "report_type": "message",
    "content": "Won $500,000 lottery promo SMS",
    "sender": "+18005550199",
    "reason": "Fake sweepstakes lottery scam requesting advance fee",
    "risk_score": 92,
    "created_at": "2026-09-25T15:54:30.000000+00:00"
  }
]
```

---

### `GET /stats`
Retrieves aggregated statistics and distribution breakdown.

**Response Body (HTTP 200):**
```json
{
  "total_reports": 12,
  "safe_count": 0,
  "suspicious_count": 2,
  "dangerous_count": 10,
  "top_scam_types": {
    "message": 8,
    "url": 2,
    "transaction": 2
  }
}
```

---

### `GET /health`
System liveness and database connection status.

**Response Body (HTTP 200):**
```json
{
  "status": "healthy",
  "service": "ScamShield Security Engine",
  "version": "1.0.0",
  "database": "connected"
}
```
