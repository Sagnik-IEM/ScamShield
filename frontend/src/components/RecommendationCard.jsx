import React from 'react';

/**
 * RecommendationCard Component
 * 
 * Derives actionable security guidance client-side from the backend verdict
 * ('Dangerous', 'Suspicious', 'Safe'), or displays a passed recommendation string.
 */
export default function RecommendationCard({ recommendation, verdict = 'Safe' }) {
  const getGuidance = () => {
    if (recommendation) return recommendation;

    const v = typeof verdict === 'string' ? verdict.toLowerCase() : 'safe';
    if (v === 'dangerous') {
      return 'High risk alert. Do not click any links, enter banking credentials, approve 2FA/OTP requests, or transfer funds. Report this incident to protect others.';
    }
    if (v === 'suspicious') {
      return 'Caution advised. Moderate risk indicators detected. Verify the sender, website domain, or payee independently through an official trusted channel before proceeding.';
    }
    return 'Low detected risk. Standard communication patterns observed. Always verify unknown senders before sharing personal information.';
  };

  const v = typeof verdict === 'string' ? verdict.toLowerCase() : 'safe';
  const color = v === 'dangerous' ? '#ef4444' : (v === 'suspicious' ? '#f59e0b' : '#38bdf8');
  const bg = v === 'dangerous' ? 'rgba(239, 68, 68, 0.1)' : (v === 'suspicious' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(56, 189, 248, 0.1)');

  return (
    <div style={{
      backgroundColor: bg,
      border: `1px solid ${color}`,
      borderRadius: '8px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>💡</span>
        <h4 style={{ fontSize: '0.95rem', color: color, fontWeight: 'bold', margin: 0 }}>
          Recommended Action
        </h4>
      </div>
      <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
        {getGuidance()}
      </p>
    </div>
  );
}
