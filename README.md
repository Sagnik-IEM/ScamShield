# ScamShield — Multi-Modal Fraud & Phishing Intelligence Platform

ScamShield is an AI-powered security intelligence platform providing real-time, multi-modal risk scoring across suspicious SMS/email messages, phishing URLs, and anomalous financial transactions. It pairs a high-performance **FastAPI backend** with a modern **React single-page application** to deliver plain-English threat explanations and community-driven threat intelligence.

---

## 🏗️ Project Architecture & Repository Structure

```
ScamShield/
├── .gitignore                            # Git ignore patterns for Python virtualenvs & Node artifacts
├── API_CONTRACT.md                       # Authoritative REST API Contract & schema specification
├── README.md                             # Repository architecture and developer guide
│
├── backend/                              # FastAPI REST API & AI/ML Risk Scoring Engine
│   ├── app/
│   │   ├── main.py                       # FastAPI application entrypoint, CORS, & route handlers
│   │   ├── config.py                     # Centralized 0–100 risk thresholds, rules, & weights
│   │   ├── schemas.py                    # Pydantic request and response contract models
│   │   ├── db.py                         # SQLite persistence with automated sensitive financial data redaction
│   │   ├── modules/
│   │   │   ├── text_risk.py              # NLP & ML Text Risk Scorer (TF-IDF + Logistic Regression)
│   │   │   ├── url_risk.py               # Domain lookalike, typosquatting & TLD heuristic engine
│   │   │   ├── transaction_risk.py       # Rule-based transaction fraud & payment velocity scorer
│   │   │   └── fusion.py                 # Multi-Modal Weighted Decision Fusion Engine
│   │   └── models/
│   │       └── classifier.pkl            # Pre-trained ML classifier artifact
│   ├── data/
│   │   ├── train_dataset.json            # Synthetic & curated scam training corpus
│   │   └── eval_dataset.json             # Labeled benchmark test dataset
│   ├── dev-preview/                      # Internal test harness used during engine development
│   ├── tests/                            # Pytest test suite (32 unit & integration tests)
│   ├── eval.py                           # Precision, recall, and F1 evaluation pipeline
│   ├── pytest.ini                        # Pytest test runner configuration
│   ├── requirements.txt                  # Python dependencies (FastAPI, scikit-learn, uvicorn, etc.)
│   ├── scam_reports.db                   # SQLite database seeded with community threat records
│   └── train.py                          # Model training script
│
└── frontend/                             # React + Vite Single-Page Web Application
    ├── public/                           # Static assets
    ├── src/
    │   ├── components/
    │   │   ├── AnalyzeButton.jsx         # Primary CTA trigger button with loading state
    │   │   ├── CommunityReports.jsx      # Screen E: Threat registry search with identifier masking
    │   │   ├── ErrorState.jsx            # User-facing error handling and retry controls
    │   │   ├── ExplanationCard.jsx       # Plain-English threat synthesizer
    │   │   ├── Header.jsx                # App navigation bar and status indicators
    │   │   ├── LoadingState.jsx          # Interactive scan progress animation
    │   │   ├── MessageInput.jsx          # Suspicious text/SMS input area
    │   │   ├── QuickFillButtons.jsx      # 1-click test scenario presets for message/URL scanning
    │   │   ├── RecommendationCard.jsx    # Actionable guidance derived from computed verdict
    │   │   ├── ReportButton.jsx          # Direct navigation to report flow with pre-filled metadata
    │   │   ├── ReportForm.jsx            # Screen D: Scam submission form
    │   │   ├── RiskBadge.jsx             # Visual status badge (Safe / Suspicious / Dangerous)
    │   │   ├── RiskScore.jsx             # Gauge and 3-tier risk breakdown (Message / URL / Transaction)
    │   │   ├── SignalList.jsx            # Detected threat reasons and risk factors
    │   │   ├── TransactionForm.jsx       # Financial transaction input form and velocity presets
    │   │   └── UrlInput.jsx              # URL scanning input
    │   ├── pages/
    │   │   ├── About.jsx                 # Platform architecture, scoring methodology & about view
    │   │   ├── Analyze.jsx               # Screen B: Comprehensive scan analysis report
    │   │   ├── Home.jsx                  # Screen A: Message & URL scanner entry view
    │   │   ├── Reports.jsx               # Screens D & E: Community Intelligence registry & submission hub
    │   │   └── Transaction.jsx           # Screen C: Payment & transfer risk evaluation
    │   ├── services/
    │   │   └── api.js                    # Production API client mapped to backend endpoints
    │   ├── styles/
    │   │   └── global.css                # Modern dark-mode styling tokens and layout rules
    │   ├── App.jsx                       # Root React router and state container
    │   └── main.jsx                      # Vite React mounting entrypoint
    ├── index.html                        # Application HTML template
    ├── package.json                      # Node dependencies and build scripts
    ├── package-lock.json                 # Dependency lockfile
    └── vite.config.js                    # Vite dev server and build configuration
```

---

## 🛡️ Core Capabilities

1. **Multi-Modal Threat Scanning (Screen A & B)**:
   - Evaluates SMS, email, WhatsApp messages, and embedded hyperlinks simultaneously.
   - Combines NLP/ML classification with domain reputation and typosquatting heuristics.
   - Displays plain-language explanations and actionable safety guidance based on computed severity.
2. **Transaction Risk Scoring (Screen C)**:
   - Analyzes transfer amount anomalies, first-time payee flags, payment channels (e.g. crypto vs. UPI), and time-of-day risks.
3. **Community Threat Registry (Screen D & E)**:
   - Searchable crowdsourced scam registry with client-side privacy masking for phone numbers, handles, and URLs.
   - 1-click reporting flow allowing users to log fraudulent numbers, links, and accounts directly into the database.
4. **Privacy-Preserving Sanitization**:
   - Automatically redacts OTPs, PINs, CVVs, and credit card numbers from database storage and logs.
5. **Calibrated Risk Framework**:
   - Standardized 0–100 score across all modalities:
     - **Safe** ($< 40$): Low detected risk based on baseline heuristics.
     - **Suspicious** ($40 \le \text{Score} \le 74$): Caution advised; multiple anomalous signals flagged.
     - **Dangerous** ($\text{Score} \ge 75$): High-confidence threat detected; immediate intervention recommended.

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**

---

### 1. Start the Backend Server

```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment (Windows PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --reload --port 8000
```

- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

---

### 2. Start the Frontend Application

```powershell
# Open a separate terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server on port 5173
npm run dev
```

- **Frontend App**: `http://localhost:5173`

---

### 3. Build & Test

```powershell
# Run backend test suite (32 passing tests)
cd backend
.\.venv\Scripts\python -m pytest -v

# Run model evaluation metrics report
.\.venv\Scripts\python eval.py

# Build frontend production bundle
cd ../frontend
npm run build
```

---

## 📡 REST API Reference

All requests and responses follow the specifications defined in [`API_CONTRACT.md`](./API_CONTRACT.md):

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/check-message` | Scans message text and URLs for phishing and coercion patterns. |
| `POST` | `/check-transaction` | Evaluates financial transfer risk, timing, channel, and memo indicators. |
| `POST` | `/report-scam` | Persists a community-submitted scam report with automatic sanitization. |
| `GET` | `/reports` | Retrieves recent community scam reports with optional limit/type filtering. |
| `GET` | `/stats` | Aggregates global threat metrics and distribution by scam category. |
| `GET` | `/health` | Verifies service health and database connection status. |
