import React from 'react';

export default function RecommendationCard({ recommendation }) {
  if (!recommendation) return null;

  return (
    <div style={{
      backgroundColor: 'rgba(56, 189, 248, 0.1)',
      border: '1px solid #38bdf8',
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>💡</span>
        <h4 style={{ fontSize: '0.95rem', color: '#38bdf8', fontWeight: 'bold' }}>Recommended Action</h4>
      </div>
      <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: '1.5' }}>
        {recommendation}
      </p>
    </div>
  );
}
