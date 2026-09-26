/**
 * ScamShield Frontend API Service Client
 * 
 * Fully aligned with ScamShield API Contract Specification (v1.0.0)
 * Base URL: http://localhost:8000
 * 
 * Authoritative Endpoints:
 * - POST /check-message
 * - POST /check-transaction
 * - POST /report-scam
 * - GET  /reports
 * - GET  /stats
 * - GET  /health
 */

export const USE_MOCKS = false;

// Granular per-endpoint mock toggles
export const MOCK_FLAGS = {
  checkMessage: false,
  checkTransaction: false,
  reportScam: false,
  getReports: false,
  getStats: false,
  getHealth: false,
  // Compatibility aliases
  analyzeMessage: false,
  analyzeUrl: false,
  analyzeTransaction: false,
  submitReport: false,
  searchReports: false,
};

export const API_BASE_URL = 'http://localhost:8000';

// =========================================================================
// Authoritative Mock Fixtures (Contract v1.0.0 Shapes)
// =========================================================================

export const mockDangerousMessage = {
  verdict: "Dangerous",
  overall_score: 89.0,
  confidence: 0.81,
  text_risk: {
    score: 80,
    label: "Dangerous",
    reasons: [
      "High urgency language detected",
      "Account/card suspension threat detected",
      "Credential/KYC verification solicitation"
    ],
    top_features: ["urgent", "suspended", "verify"]
  },
  url_risk: {
    score: 100,
    label: "Dangerous",
    reasons: [
      "High-risk, abuse-prone top-level domain detected (.xyz)",
      "Domain impersonates legitimate brand 'chase' (chase-verify)",
      "Sensitive credential/banking path keyword detected: login"
    ],
    extracted_urls: ["http://chase-verify.xyz/login"],
    domain_details: [
      {
        url: "http://chase-verify.xyz/login",
        domain: "chase-verify.xyz",
        is_lookalike: true,
        target_brand: "chase",
        levenshtein_distance: null,
        high_risk_tld: true,
        has_ip_host: false,
        suspicious_path_detected: true,
        score: 100,
        reasons: [
          "High-risk, abuse-prone top-level domain detected (.xyz)",
          "Domain impersonates legitimate brand 'chase' (chase-verify)",
          "Sensitive credential/banking path keyword detected: login"
        ]
      }
    ]
  },
  reasons: [
    "High urgency language detected",
    "Account/card suspension threat detected",
    "Credential/KYC verification solicitation",
    "High-risk, abuse-prone top-level domain detected (.xyz)",
    "Domain impersonates legitimate brand 'chase' (chase-verify)",
    "Sensitive credential/banking path keyword detected: login"
  ]
};

export const mockSafeMessage = {
  verdict: "Safe",
  overall_score: 12.0,
  confidence: 0.95,
  text_risk: {
    score: 10,
    label: "Safe",
    reasons: [
      "No urgency or coercive keywords detected",
      "Standard conversational language pattern"
    ],
    top_features: ["dinner", "tomorrow", "meet"]
  },
  url_risk: {
    score: 0,
    label: "Safe",
    reasons: [],
    extracted_urls: [],
    domain_details: []
  },
  reasons: [
    "No urgency or coercive keywords detected",
    "Standard conversational language pattern"
  ]
};

export const mockSuspiciousMessage = {
  verdict: "Suspicious",
  overall_score: 55.0,
  confidence: 0.72,
  text_risk: {
    score: 58,
    label: "Suspicious",
    reasons: [
      "Moderate pressure keywords detected",
      "Unverified promotional offer"
    ],
    top_features: ["discount", "limited", "offer"]
  },
  url_risk: {
    score: 50,
    label: "Suspicious",
    reasons: [
      "Unfamiliar domain registration"
    ],
    extracted_urls: ["https://promo-deals-daily.net/save"],
    domain_details: [
      {
        url: "https://promo-deals-daily.net/save",
        domain: "promo-deals-daily.net",
        is_lookalike: false,
        target_brand: null,
        levenshtein_distance: null,
        high_risk_tld: false,
        has_ip_host: false,
        suspicious_path_detected: false,
        score: 50,
        reasons: ["Unfamiliar domain registration"]
      }
    ]
  },
  reasons: [
    "Moderate pressure keywords detected",
    "Unverified promotional offer",
    "Unfamiliar domain registration"
  ]
};

export const mockDangerousUrl = {
  verdict: "Dangerous",
  overall_score: 95.0,
  confidence: 0.88,
  text_risk: {
    score: 0,
    label: "Safe",
    reasons: [],
    top_features: []
  },
  url_risk: {
    score: 95,
    label: "Dangerous",
    reasons: [
      "High-risk, abuse-prone top-level domain detected (.top)",
      "Domain impersonates legitimate brand 'paypal' (paypal-security-login)",
      "Sensitive credential/banking path keyword detected: login"
    ],
    extracted_urls: ["https://paypal-security-login.top"],
    domain_details: [
      {
        url: "https://paypal-security-login.top",
        domain: "paypal-security-login.top",
        is_lookalike: true,
        target_brand: "paypal",
        levenshtein_distance: null,
        high_risk_tld: true,
        has_ip_host: false,
        suspicious_path_detected: true,
        score: 95,
        reasons: [
          "High-risk, abuse-prone top-level domain detected (.top)",
          "Domain impersonates legitimate brand 'paypal' (paypal-security-login)",
          "Sensitive credential/banking path keyword detected: login"
        ]
      }
    ]
  },
  reasons: [
    "High-risk, abuse-prone top-level domain detected (.top)",
    "Domain impersonates legitimate brand 'paypal' (paypal-security-login)",
    "Sensitive credential/banking path keyword detected: login"
  ]
};

export const mockSafeUrl = {
  verdict: "Safe",
  overall_score: 5.0,
  confidence: 0.98,
  text_risk: {
    score: 0,
    label: "Safe",
    reasons: [],
    top_features: []
  },
  url_risk: {
    score: 5,
    label: "Safe",
    reasons: [
      "Legitimate trusted domain authority",
      "Valid TLS/SSL standard structure"
    ],
    extracted_urls: ["https://chase.com"],
    domain_details: [
      {
        url: "https://chase.com",
        domain: "chase.com",
        is_lookalike: false,
        target_brand: null,
        levenshtein_distance: null,
        high_risk_tld: false,
        has_ip_host: false,
        suspicious_path_detected: false,
        score: 5,
        reasons: ["Legitimate trusted domain authority"]
      }
    ]
  },
  reasons: [
    "Legitimate trusted domain authority",
    "Valid TLS/SSL standard structure"
  ]
};

export const mockDangerousTransaction = {
  verdict: "Dangerous",
  risk_score: 80,
  reasons: [
    "Cryptocurrency transfer destination",
    "Lottery/escrow scam beneficiary identifier",
    "High amount transferred to a first-time payee",
    "High risk payment channel (crypto)",
    "Transaction initiated during anomalous late-night hours",
    "High urgency memo pressure",
    "Coerced extortion or fake compliance remark",
    "Advance-fee fraud indicator in memo"
  ],
  risk_factors: [
    {
      factor: "High-Risk Payee Keyword",
      severity: "High",
      description: "Cryptocurrency transfer destination",
      points_added: 35
    },
    {
      factor: "Large First-Time Transfer",
      severity: "High",
      description: "High monetary value (> 50,000 USD / INR) sent to an unverified first-time recipient",
      points_added: 35
    },
    {
      factor: "Irreversible Payment Channel",
      severity: "High",
      description: "Channel 'crypto' offers zero fraud chargeback or escrow recovery",
      points_added: 30
    }
  ]
};

export const mockSafeTransaction = {
  verdict: "Safe",
  risk_score: 10,
  reasons: [
    "Standard peer-to-peer transfer pattern",
    "Known beneficiary historical pattern",
    "Normal daytime transaction hour"
  ],
  risk_factors: []
};

export const mockReportScamResponse = {
  report_id: 1,
  status: "success",
  message: "Scam report successfully logged to community threat intelligence DB.",
  created_at: "2026-09-25T15:54:30.000000+00:00"
};

export const mockReportsList = [
  {
    id: 1,
    report_type: "message",
    content: "Won $500,000 lottery promo SMS",
    sender: "+18005550199",
    reason: "Fake sweepstakes lottery scam requesting advance fee",
    risk_score: 92,
    created_at: "2026-09-25T15:54:30.000000+00:00"
  },
  {
    id: 2,
    report_type: "transaction",
    content: "crypto_escrow_refund@upi",
    sender: "crypto_escrow_refund@upi",
    reason: "Fraudulent escrow account requesting advance clearance fees for fake crypto releases",
    risk_score: 85,
    created_at: "2026-09-25T16:10:00.000000+00:00"
  }
];

export const mockStatsResponse = {
  total_reports: 12,
  safe_count: 0,
  suspicious_count: 2,
  dangerous_count: 10,
  top_scam_types: {
    message: 8,
    url: 2,
    transaction: 2
  }
};

export const mockHealthResponse = {
  status: "healthy",
  service: "ScamShield Security Engine",
  version: "1.0.0",
  database: "connected"
};

// Grouped fixtures lookup
export const MOCK_FIXTURES = {
  checkMessage: {
    DANGEROUS: mockDangerousMessage,
    SAFE: mockSafeMessage,
    SUSPICIOUS: mockSuspiciousMessage
  },
  checkTransaction: {
    DANGEROUS: mockDangerousTransaction,
    SAFE: mockSafeTransaction
  },
  reportScam: mockReportScamResponse,
  getReports: mockReportsList,
  getStats: mockStatsResponse,
  getHealth: mockHealthResponse,
  // Backwards-compatibility lookup keys
  analyzeMessage: {
    DANGEROUS: mockDangerousMessage,
    SAFE: mockSafeMessage
  },
  analyzeUrl: {
    DANGEROUS: mockDangerousUrl,
    SAFE: mockSafeUrl
  },
  analyzeTransaction: {
    DANGEROUS: mockDangerousTransaction,
    SAFE: mockSafeTransaction
  },
  submitReport: mockReportScamResponse,
  searchReports: mockReportsList
};

// =========================================================================
// Real Backend API Client Functions
// =========================================================================

/**
 * 1. POST /check-message
 * Scans message text and URLs for phishing/scam risk.
 * 
 * @param {Object|string} payload - { message: string, urls?: string[] } or string message
 * @param {string} variant - Mock variant ('DANGEROUS' | 'SAFE' | 'SUSPICIOUS')
 * @returns {Promise<Object>} CheckMessageResponse
 */
export async function checkMessage(payload, variant = 'DANGEROUS') {
  if (USE_MOCKS || MOCK_FLAGS.checkMessage || MOCK_FLAGS.analyzeMessage) {
    const isSafe = variant === 'SAFE' || payload?.variant === 'SAFE' || payload?.mockVariant === 'SAFE';
    const isSuspicious = variant === 'SUSPICIOUS' || payload?.variant === 'SUSPICIOUS' || payload?.mockVariant === 'SUSPICIOUS';
    if (isSafe) return mockSafeMessage;
    if (isSuspicious) return mockSuspiciousMessage;
    return mockDangerousMessage;
  }

  let requestBody = {};
  if (typeof payload === 'string') {
    requestBody = { message: payload };
  } else if (payload && typeof payload === 'object') {
    const message = payload.message || payload.content || '';
    let urls = payload.urls;
    if (!urls && payload.url) {
      urls = [payload.url];
    }
    requestBody = {
      message,
      ...(urls ? { urls: Array.isArray(urls) ? urls : [urls] } : {})
    };
  }

  const response = await fetch(`${API_BASE_URL}/check-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const detail = errData?.detail || response.statusText;
    throw new Error(`Check message failed (${response.status}): ${detail}`);
  }

  return response.json();
}

/**
 * 2. POST /check-transaction
 * Evaluates transaction fraud and anomalous payment patterns.
 * 
 * @param {Object} payload - { payee: string, amount: number, timestamp?: string, account_type?: string, is_first_time?: boolean, notes?: string }
 * @param {string} variant - Mock variant ('DANGEROUS' | 'SAFE')
 * @returns {Promise<Object>} CheckTransactionResponse
 */
export async function checkTransaction(payload, variant = 'DANGEROUS') {
  if (USE_MOCKS || MOCK_FLAGS.checkTransaction || MOCK_FLAGS.analyzeTransaction) {
    const isSafe = variant === 'SAFE' || payload?.variant === 'SAFE' || payload?.mockVariant === 'SAFE';
    return isSafe ? mockSafeTransaction : mockDangerousTransaction;
  }

  const requestBody = {
    payee: String(payload.payee || ''),
    amount: Number(payload.amount ?? 0),
    timestamp: payload.timestamp || null,
    account_type: payload.account_type || 'upi',
    is_first_time: payload.is_first_time ?? payload.is_new_payee ?? true,
    notes: payload.notes || payload.anomaly_note || null
  };

  const response = await fetch(`${API_BASE_URL}/check-transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const detail = errData?.detail || response.statusText;
    throw new Error(`Check transaction failed (${response.status}): ${detail}`);
  }

  return response.json();
}

/**
 * 3. POST /report-scam
 * Submits a newly identified scam or fraudulent activity to the community DB.
 * 
 * @param {Object} payload - { report_type: string, content: string, sender?: string, reported_reason: string, reporter_email?: string, risk_score_at_report?: number }
 * @returns {Promise<Object>} ReportScamResponse
 */
export async function reportScam(payload) {
  if (USE_MOCKS || MOCK_FLAGS.reportScam || MOCK_FLAGS.submitReport) {
    return mockReportScamResponse;
  }

  let mappedType = payload.report_type || 'message';
  const rawType = (payload.report_type || payload.identifier_type || payload.category || '').toLowerCase();
  if (rawType.includes('url') || rawType.includes('link') || rawType.includes('phishing')) {
    mappedType = 'url';
  } else if (rawType.includes('transaction') || rawType.includes('upi') || rawType.includes('payment')) {
    mappedType = 'transaction';
  } else if (rawType.includes('message') || rawType.includes('phone') || rawType.includes('sms')) {
    mappedType = 'message';
  } else if (['message', 'url', 'transaction', 'other'].includes(rawType)) {
    mappedType = rawType;
  }

  const requestBody = {
    report_type: mappedType,
    content: payload.content || payload.identifier || payload.message || payload.url || 'Unspecified scam content',
    sender: payload.sender || payload.senderId || payload.phoneNumber || null,
    reported_reason: payload.reported_reason || payload.reason || payload.description || 'Community reported scam',
    reporter_email: payload.reporter_email || payload.email || null,
    risk_score_at_report: payload.risk_score_at_report !== undefined
      ? Number(payload.risk_score_at_report)
      : (payload.risk_score !== undefined ? Number(payload.risk_score) : null)
  };

  const response = await fetch(`${API_BASE_URL}/report-scam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const detail = errData?.detail || response.statusText;
    throw new Error(`Report scam failed (${response.status}): ${detail}`);
  }

  return response.json();
}

/**
 * 4. GET /reports
 * Retrieves recent community scam reports with optional filtering.
 * 
 * @param {Object} [params] - { limit?: number, report_type?: string }
 * @returns {Promise<Array<Object>>} List of ScamReportItem
 */
export async function getReports(params = {}) {
  if (USE_MOCKS || MOCK_FLAGS.getReports) {
    return mockReportsList;
  }

  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', String(params.limit));
  if (params.report_type) queryParams.append('report_type', params.report_type);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `${API_BASE_URL}/reports?${queryString}` : `${API_BASE_URL}/reports`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const detail = errData?.detail || response.statusText;
    throw new Error(`Get reports failed (${response.status}): ${detail}`);
  }

  return response.json();
}

/**
 * 5. GET /stats
 * Retrieves global fraud statistics and threat distribution breakdown.
 * 
 * @returns {Promise<Object>} StatsResponse
 */
export async function getStats() {
  if (USE_MOCKS || MOCK_FLAGS.getStats) {
    return mockStatsResponse;
  }

  const response = await fetch(`${API_BASE_URL}/stats`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const detail = errData?.detail || response.statusText;
    throw new Error(`Get stats failed (${response.status}): ${detail}`);
  }

  return response.json();
}

/**
 * 6. GET /health
 * Verifies system liveness and database connection status.
 * 
 * @returns {Promise<Object>} Health status
 */
export async function getHealth() {
  if (USE_MOCKS || MOCK_FLAGS.getHealth) {
    return mockHealthResponse;
  }

  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const detail = errData?.detail || response.statusText;
    throw new Error(`Health check failed (${response.status}): ${detail}`);
  }

  return response.json();
}

// =========================================================================
// Aliases & Wrappers for Frontend Compatibility
// =========================================================================

export const checkHealth = getHealth;
export const analyzeMessage = checkMessage;
export const analyze = checkMessage;
export const analyzeTransaction = checkTransaction;
export const submitReport = reportScam;

/**
 * Compatibility wrapper for scanning bare URLs.
 * Maps URL directly to checkMessage backend endpoint.
 */
export async function analyzeUrl(url, variant = 'DANGEROUS') {
  if (USE_MOCKS || MOCK_FLAGS.analyzeUrl) {
    const isSafe = variant === 'SAFE' || (typeof url === 'object' && (url?.variant === 'SAFE' || url?.mockVariant === 'SAFE'));
    return isSafe ? mockSafeUrl : mockDangerousUrl;
  }
  const rawUrl = typeof url === 'string' ? url : (url?.url || '');
  return checkMessage({ message: rawUrl, urls: [rawUrl] }, variant);
}

/**
 * Compatibility wrapper for searching community reports.
 * Since the backend does not expose a dedicated /reports/search endpoint,
 * this function calls getReports and performs client-side matching on
 * content, sender, and reason fields.
 */
export async function searchReports(identifier, variant = 'Dangerous') {
  if (USE_MOCKS || MOCK_FLAGS.searchReports) {
    const isSafe = variant === 'Safe' || variant === 'SAFE' || (typeof identifier === 'object' && (identifier?.variant === 'Safe' || identifier?.variant === 'SAFE'));
    if (isSafe) {
      return { reported: false, report_count: 0, category: null, reports: [] };
    }
    return {
      reported: true,
      report_count: mockReportsList.length,
      category: mockReportsList[0]?.report_type || "message",
      reports: mockReportsList
    };
  }

  const query = (typeof identifier === 'string' ? identifier : (identifier?.identifier || identifier?.query || '')).trim().toLowerCase();
  if (!query) {
    return { reported: false, report_count: 0, category: null, reports: [] };
  }

  const reports = await getReports({ limit: 200 });
  const matched = (Array.isArray(reports) ? reports : []).filter(r => 
    (r.content && r.content.toLowerCase().includes(query)) ||
    (r.sender && r.sender.toLowerCase().includes(query)) ||
    (r.reason && r.reason.toLowerCase().includes(query))
  );

  return {
    reported: matched.length > 0,
    report_count: matched.length,
    category: matched[0]?.report_type || null,
    reports: matched
  };
}
