export const USE_MOCKS = false;

// Granular per-endpoint mock toggles (All live for end-to-end integration):
export const MOCK_FLAGS = {
  analyzeMessage: false,
  analyzeUrl: false,
  analyzeTransaction: false,
  submitReport: false,
  searchReports: false
};

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Static JSON fixtures matching Member A's frozen contract exactly

export const mockDangerousMessage = {
  risk_score: 87,
  verdict: "DANGEROUS",
  text_analysis: { score: 84, prediction: "scam", confidence: 0.93 },
  url_analysis: null,
  transaction_analysis: null,
  signals: [
    { type: "urgency", severity: "high", description: "The message pressures immediate action" },
    { type: "financial_reward", severity: "high", description: "The message promises unexpected money or prizes" }
  ],
  recommendation: "Do not click the link or provide financial information."
};

export const mockSafeMessage = {
  risk_score: 12,
  verdict: "SAFE",
  text_analysis: { score: 10, prediction: "ham", confidence: 0.96 },
  url_analysis: null,
  transaction_analysis: null,
  signals: [],
  recommendation: "Low detected risk. Always verify the sender's identity independently before taking action."
};

export const mockDangerousUrl = {
  risk_score: 91,
  verdict: "DANGEROUS",
  domain: "example.com",
  signals: [
    "Suspicious domain",
    "Possible lookalike domain",
    "Domain reputation unknown"
  ]
};

export const mockSafeUrl = {
  risk_score: 8,
  verdict: "SAFE",
  domain: "example.com",
  signals: []
};

export const mockDangerousTransaction = {
  risk_score: 85,
  verdict: "DANGEROUS",
  signals: [
    "New payee",
    "Unusually high transaction amount",
    "Unusual transaction time",
    "High transaction frequency"
  ]
};

export const mockSafeTransaction = {
  risk_score: 14,
  verdict: "SAFE",
  signals: []
};

export const mockSubmitReport = {
  success: true,
  report_id: "REPORT-001"
};

export const mockSearchReports = {
  reported: true,
  report_count: 7,
  category: "Payment Scam"
};

export const mockSafeSearchReports = {
  reported: false,
  report_count: 0,
  category: null
};

// Grouped fixtures lookup
export const MOCK_FIXTURES = {
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
  submitReport: mockSubmitReport,
  searchReports: {
    DANGEROUS: mockSearchReports,
    SAFE: mockSafeSearchReports
  }
};

/**
 * 1. POST /api/v1/analyze
 * Analyzes message, url, and/or transaction payload.
 */
export async function analyzeMessage(payload, variant = 'DANGEROUS') {
  if (MOCK_FLAGS.analyzeMessage) {
    const isSafe = variant === 'SAFE' || payload?.variant === 'SAFE' || payload?.mockVariant === 'SAFE';
    return isSafe ? mockSafeMessage : mockDangerousMessage;
  }
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Analyze message failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 2. POST /api/v1/analyze-url
 * Analyzes standalone URL.
 */
export async function analyzeUrl(url, variant = 'DANGEROUS') {
  if (MOCK_FLAGS.analyzeUrl) {
    const isSafe = variant === 'SAFE' || (typeof url === 'object' && (url?.variant === 'SAFE' || url?.mockVariant === 'SAFE'));
    const baseFixture = isSafe ? mockSafeUrl : mockDangerousUrl;
    const rawUrl = typeof url === 'string' ? url : url?.url;
    const extractedDomain = rawUrl ? rawUrl.replace(/^https?:\/\//, '').split('/')[0] : baseFixture.domain;
    return {
      ...baseFixture,
      domain: extractedDomain || baseFixture.domain
    };
  }
  const bodyPayload = typeof url === 'string' ? { url } : url;
  const response = await fetch(`${API_BASE_URL}/analyze-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyPayload)
  });
  if (!response.ok) {
    throw new Error(`Analyze URL failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 3. POST /api/v1/analyze-transaction
 * Analyzes payment and transaction indicators.
 */
export async function analyzeTransaction(payload, variant = 'DANGEROUS') {
  if (MOCK_FLAGS.analyzeTransaction) {
    const isSafe = variant === 'SAFE' || payload?.variant === 'SAFE' || payload?.mockVariant === 'SAFE';
    return isSafe ? mockSafeTransaction : mockDangerousTransaction;
  }
  const response = await fetch(`${API_BASE_URL}/analyze-transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Analyze transaction failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 4. POST /api/v1/reports
 * Submits a community scam report.
 */
export async function submitReport(payload) {
  if (MOCK_FLAGS.submitReport) {
    return mockSubmitReport;
  }
  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Submit report failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * 5. GET /api/v1/reports/search?identifier=...
 * Searches community reports by identifier.
 */
export async function searchReports(identifier, variant = 'DANGEROUS') {
  if (MOCK_FLAGS.searchReports) {
    const isSafe = variant === 'SAFE' || (typeof identifier === 'object' && identifier?.variant === 'SAFE');
    return isSafe ? mockSafeSearchReports : mockSearchReports;
  }
  const query = typeof identifier === 'string' ? identifier : identifier?.identifier;
  const params = new URLSearchParams({ identifier: query });
  const response = await fetch(`${API_BASE_URL}/reports/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Search reports failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Backwards-compatibility alias
export const analyze = analyzeMessage;
