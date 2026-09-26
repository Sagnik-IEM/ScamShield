import React from 'react';

/**
 * SignalList Component
 * 
 * Renders reasons (string[]) from CheckMessageResponse/CheckTransactionResponse
 * or risk_factors objects from CheckTransactionResponse.
 */
export default function SignalList({ signals = [], reasons = [] }) {
  const items = (reasons && reasons.length > 0) ? reasons : signals;

  if (!items || items.length === 0) {
    return (
      <div style={{
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        fontStyle: 'italic',
        padding: '0.75rem 1rem',
        backgroundColor: '#0b1120',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
      }}>
        No threat indicators detected.
      </div>
    );
  }

  const getSeverityColor = (sev) => {
    switch (String(sev).toLowerCase()) {
      case 'critical':
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
      default:
        return '#38bdf8';
    }
  };

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0, margin: 0 }}>
      {items.map((item, idx) => {
        const isObject = typeof item === 'object' && item !== null;
        const descriptionText = isObject
          ? (item.description || item.factor || item.reason || 'Threat indicator detected')
          : String(item);
        const severity = isObject ? (item.severity || 'high') : 'high';
        const factorName = isObject && item.factor ? item.factor : null;
        const pointsAdded = isObject && item.points_added ? item.points_added : null;

        return (
          <li
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.75rem',
              fontSize: '0.95rem',
              backgroundColor: '#0b1120',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              borderLeft: `4px solid ${getSeverityColor(severity)}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', flex: 1 }}>
              <span style={{ fontSize: '1rem', lineHeight: '1.4' }}>⚠️</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                {factorName && (
                  <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>
                    {factorName}
                  </strong>
                )}
                <span style={{ color: 'var(--text-main)', lineHeight: '1.5', fontSize: '0.92rem' }}>
                  {descriptionText}
                </span>
              </div>
            </div>

            {pointsAdded !== null && (
              <span style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: '700',
                whiteSpace: 'nowrap'
              }}>
                +{pointsAdded} pts
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
