import React from 'react';

/**
 * Reusable LoadingState Component
 * Displays a clean spinner and plain-language progress message
 */
export default function LoadingState({
  message = "Analyzing threat vectors and signals...",
  subMessage = "Evaluating risk patterns against heuristic and ML engines"
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      gap: '1rem',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border-color)',
      color: '#f8fafc',
      textAlign: 'center',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid #334155',
        borderTop: '3px solid #38bdf8',
        borderRadius: '50%',
        animation: 'scamshield-spin 0.9s linear infinite'
      }} />
      <style>{`
        @keyframes scamshield-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#f8fafc', margin: 0 }}>
          {message}
        </p>
        {subMessage && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
}
