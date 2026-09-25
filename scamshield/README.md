# ScamShield — Multi-Modal Fraud & Phishing Intelligence Engine

ScamShield is an AI-powered scam and fraud intelligence engine providing real-time multi-modal risk scoring across SMS/email messages, phishing URLs, and financial transactions.

---

## ⚠️ Important Architectural Notice Regarding Frontend

> [!IMPORTANT]
> The folder `backend/dev-preview/` contains an **internal test harness only** used for backend verification during development.
>
> **It is NOT the hackathon deliverable frontend.**
> The official frontend application is being developed separately (in React / Flutter) against the stable ScamShield OpenAPI specification contract documented in [`API_CONTRACT.md`](./API_CONTRACT.md) and interactive Swagger UI at `/docs`.

---

## Architecture Overview

```
scamshield/
├── API_CONTRACT.md                   # Official API Contract specification for Frontend integration
├── README.md                         # Repository documentation
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI REST API entrypoint & CORS
│   │   ├── config.py                 # Centralized 0-100 thresholds & fusion weights
│   │   ├── schemas.py                # Final Pydantic data contract models
│   │   ├── db.py                     # SQLite DB with automated sensitive data redaction
│   │   ├── modules/
│   │   │   ├── text_risk.py          # Standalone NLP/ML Text Risk Scorer
│   │   │   ├── url_risk.py           # Standalone Lookalike Domain Heuristics Scorer
│   │   │   ├── transaction_risk.py   # Standalone Transaction Fraud Rule Scorer
│   │   │   └── fusion.py             # Extensible Multi-Modal Weighted Fusion Engine
│   │   └── models/
│   │       └── classifier.pkl        # Serialized ML classifier artifact
│   ├── dev-preview/                  # Internal Dev Test Harness ONLY (Not the deliverable UI)
│   ├── data/
│   │   ├── train_dataset.json        # Training corpus
│   │   └── eval_dataset.json         # Labeled evaluation benchmark dataset
│   ├── tests/                        # 31+ unit & integration test suites
│   ├── eval.py                       # Precision, Recall, F1 evaluation pipeline
│   └── train.py                      # TF-IDF + Logistic Regression model training script
```

---

## Key Guarantees & Constraints

1. **Strict 0–100 Scale**:
   - `Safe`: Score $< 40$ (Calibrated "Low detected risk")
   - `Suspicious`: $40 \le \text{Score} \le 74$
   - `Dangerous`: $\text{Score} \ge 75$
2. **Zero Cross-Imports**: The ML component (`text_risk.py`), URL heuristics (`url_risk.py`), transaction rules (`transaction_risk.py`), and fusion engine (`fusion.py`) have zero inter-module cross-imports. All configurations are centralized in `app.config`.
3. **Sensitive Financial Data Redaction**: Automatic stripping of card numbers, CVVs, PINs, and OTPs in database persistence and logging.
4. **Offline & Self-Contained**: 100% operational with no third-party API keys or external reputation services required.
5. **CORS Globally Enabled**: `allow_origins=["*"]` allows any frontend port to connect immediately.

---

## Quickstart

```powershell
# 1. Start FastAPI Backend Server
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 2. View Interactive Swagger API Documentation
# Navigate to http://localhost:8000/docs

# 3. Run Test Suite
python -m pytest -v

# 4. Run Evaluation Metrics Report
python eval.py
```
