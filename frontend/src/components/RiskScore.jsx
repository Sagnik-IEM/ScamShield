import React from 'react';

/**
 * RiskScore Component
 * 
 * Requirements:
 * 1. Must always render three rows -- Message Risk, URL Risk, Transaction Risk -- 
 *    even when a component's value is null.
 * 2. Displays calibrated score from overall_score or score.
 * 3. Specific copy when data was not provided:
 *    - No message text -> "Message analysis unavailable because no text was provided."
 *    - No URL found -> "Insufficient information for URL analysis."
 *    - No transaction -> "Transaction risk unavailable because transaction details were not provided."
 */
export default function RiskScore({
  score = null,
  overall_score = null,
  overallScore = null,
  messageRisk = null,
  text_risk = null,
  textRisk = null,
  textScore = null,
  urlRisk = null,
  url_risk = null,
  urlScore = null,
  transactionRisk = null,
  transactionScore = null,
  risk_score = null
}) {
  // Resolve overall score
  const resolvedScore = overall_score ?? overallScore ?? score ?? risk_score ?? 0;

  // Resolve message risk score
  let resolvedMessageRisk = messageRisk ?? textScore;
  if (resolvedMessageRisk === null && text_risk !== null && typeof text_risk === 'object') {
    resolvedMessageRisk = text_risk.score;
  } else if (resolvedMessageRisk === null && textRisk !== null && typeof textRisk === 'object') {
    resolvedMessageRisk = textRisk.score;
  }

  // Resolve URL risk score
  let resolvedUrlRisk = urlRisk ?? urlScore;
  if (resolvedUrlRisk === null && url_risk !== null && typeof url_risk === 'object') {
    resolvedUrlRisk = url_risk.score;
  } else if (resolvedUrlRisk === null && urlRisk !== null && typeof urlRisk === 'object') {
    resolvedUrlRisk = urlRisk.score;
  }

  // Resolve transaction risk score
  const resolvedTransactionRisk = transactionRisk ?? transactionScore;

  const getScoreColor = (val) => {
    if (val === null || val === undefined) return '#94a3b8';
    if (val >= 75) return '#ef4444'; // Dangerous (>= 75)
    if (val >= 40) return '#f59e0b'; // Suspicious (40-74)
    return '#10b981'; // Safe (< 40)
  };

  const rows = [
    {
      label: 'Message Risk',
      value: resolvedMessageRisk,
      icon: '💬',
      fallbackText: 'Message analysis unavailable because no text was provided.'
    },
    {
      label: 'URL Risk',
      value: resolvedUrlRisk,
      icon: '🔗',
      fallbackText: 'Insufficient information for URL analysis.'
    },
    {
      label: 'Transaction Risk',
      value: resolvedTransactionRisk,
      icon: '💳',
      fallbackText: 'Transaction risk unavailable because transaction details were not provided.'
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '1.5rem',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      width: '100%'
    }}>
      {/* Overall Score */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Overall Risk Score
        </span>
        <div style={{ fontSize: '3rem', fontWeight: '800', color: getScoreColor(resolvedScore), lineHeight: '1.1' }}>
          {typeof resolvedScore === 'number' ? Math.round(resolvedScore) : resolvedScore}{' '}
          <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '400' }}>/ 100</span>
        </div>
      </div>

      {/* Sub-scores: ALWAYS renders three rows (Message Risk, URL Risk, Transaction Risk) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1rem',
        width: '100%'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
          Modality Score Breakdown
        </div>

        {rows.map((row) => {
          const isAvailable = row.value !== null && row.value !== undefined;
          return (
            <div
              key={row.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
                padding: '0.75rem 0.9rem',
                backgroundColor: '#0b1120',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>{row.icon}</span>
                  <span style={{ fontSize: '0.92rem', color: '#f8fafc', fontWeight: '600' }}>
                    {row.label}
                  </span>
                </div>

                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: isAvailable ? '700' : '400',
                  color: isAvailable ? getScoreColor(row.value) : 'var(--text-muted)',
                  fontStyle: isAvailable ? 'normal' : 'italic'
                }}>
                  {isAvailable ? `${Math.round(row.value)} / 100` : 'Not available'}
                </div>
              </div>

              {!isAvailable && (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', paddingLeft: '1.5rem', lineHeight: '1.3' }}>
                  {row.fallbackText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
