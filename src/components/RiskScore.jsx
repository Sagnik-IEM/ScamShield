import React from 'react';

/**
 * RiskScore Component
 * 
 * Requirements:
 * 1. Must always render three rows -- Message Risk, URL Risk, Transaction Risk -- 
 *    even when a component's value is null.
 * 2. A null component score shows "Not available", it is never omitted from the layout.
 * 3. Specific backend copy when data was not provided:
 *    - No URL found in message -> "Insufficient information for URL analysis."
 *    - Incomplete transaction fields -> "Transaction risk unavailable because transaction details were not provided."
 */
export default function RiskScore({
  score = 0,
  messageRisk = null,
  textScore = null,
  urlRisk = null,
  urlScore = null,
  transactionRisk = null,
  transactionScore = null
}) {
  // Support both prop naming conventions
  const resolvedMessageRisk = messageRisk !== null ? messageRisk : textScore;
  const resolvedUrlRisk = urlRisk !== null ? urlRisk : urlScore;
  const resolvedTransactionRisk = transactionRisk !== null ? transactionRisk : transactionScore;

  const getScoreColor = (val) => {
    if (val === null || val === undefined) return '#94a3b8';
    if (val >= 70) return '#ef4444';
    if (val >= 30) return '#f59e0b';
    return '#10b981';
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
        <div style={{ fontSize: '3rem', fontWeight: '800', color: getScoreColor(score), lineHeight: '1.1' }}>
          {score} <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: '400' }}>/ 100</span>
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
          Sub-Score Breakdown
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
                  {isAvailable ? `${row.value} / 100` : 'Not available'}
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
