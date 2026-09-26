import React from 'react';

/**
 * RiskBadge Component
 * 
 * Supports real backend verdicts: "Safe", "Suspicious", "Dangerous"
 * (also backwards-compatible with uppercase strings).
 */
export default function RiskBadge({ verdict = 'Safe' }) {
  const normalizedVerdict = typeof verdict === 'string' ? verdict.toLowerCase() : 'safe';

  const badgeConfig = {
    safe: {
      label: 'Low detected risk',
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      border: '#10b981'
    },
    suspicious: {
      label: 'Suspicious',
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      border: '#f59e0b'
    },
    dangerous: {
      label: 'Dangerous',
      bg: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
      border: '#ef4444'
    }
  };

  const current = badgeConfig[normalizedVerdict] || badgeConfig.safe;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.35rem 0.85rem',
      borderRadius: '9999px',
      fontSize: '0.85rem',
      fontWeight: '700',
      letterSpacing: '0.04em',
      backgroundColor: current.bg,
      color: current.color,
      border: `1px solid ${current.border}`
    }}>
      {current.label}
    </span>
  );
}
