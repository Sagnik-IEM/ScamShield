import React from 'react';

/**
 * RiskBadge Component
 * 
 * Requirement 2:
 * SAFE state must be labeled "Low detected risk" -- not "Definitely safe" or similar.
 */
export default function RiskBadge({ verdict = 'SAFE' }) {
  const normalizedVerdict = typeof verdict === 'string' ? verdict.toUpperCase() : 'SAFE';

  const badgeConfig = {
    SAFE: {
      label: 'Low detected risk',
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      border: '#10b981'
    },
    SUSPICIOUS: {
      label: 'SUSPICIOUS',
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      border: '#f59e0b'
    },
    DANGEROUS: {
      label: 'DANGEROUS',
      bg: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
      border: '#ef4444'
    }
  };

  const current = badgeConfig[normalizedVerdict] || badgeConfig.SAFE;

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
