import React from 'react';

/**
 * SignalList Component
 * 
 * Requirement 3:
 * Must render each signal's plain-language "description" field -- 
 * confirm it is not rendering a raw signal "type" code like urgency_high anywhere.
 */
export default function SignalList({ signals = [] }) {
  if (!signals || signals.length === 0) {
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
        No risk signals detected.
      </div>
    );
  }

  const getSeverityColor = (sev) => {
    switch (sev) {
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
      {signals.map((sig, idx) => {
        const isObject = typeof sig === 'object' && sig !== null;
        // Strictly use description for object signals; NEVER fall back to type
        const descriptionText = isObject ? (sig.description || 'Threat pattern detected') : String(sig);
        const severity = isObject ? sig.severity : 'medium';

        return (
          <li
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              fontSize: '0.95rem',
              backgroundColor: '#0b1120',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              borderLeft: `4px solid ${getSeverityColor(severity)}`
            }}
          >
            <span style={{ fontSize: '1rem', lineHeight: '1.4' }}>⚠️</span>
            <span style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>
              {descriptionText}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
