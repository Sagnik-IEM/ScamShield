import React from 'react';

/**
 * Reusable ErrorState Component
 * 
 * Requirements:
 * - Network/fetch failure -> a friendly retry state with a retry button -- never a raw stack trace or a blank screen.
 * - Handles specific backend feedback gracefully without breaking the layout.
 */
export default function ErrorState({
  error,
  onRetry,
  title = "Analysis Notice",
  fallbackMessage = "Unable to complete request. Please verify your inputs or check connection and try again."
}) {
  // Extract and format message gracefully, preventing any raw stack traces
  const formatErrorMessage = (err) => {
    if (!err) return fallbackMessage;

    const raw = typeof err === 'string' ? err : (err.message || String(err));

    // Network / fetch failures
    if (
      raw.includes('Failed to fetch') ||
      raw.includes('NetworkError') ||
      raw.includes('network') ||
      raw.includes('status 500') ||
      raw.includes('ECONNREFUSED')
    ) {
      return "Unable to connect to ScamShield service. Please check your internet connection or try again shortly.";
    }

    // Exact backend cases
    if (raw.includes('No URL') || raw.includes('Insufficient information')) {
      return "Insufficient information for URL analysis.";
    }

    if (raw.includes('Incomplete transaction') || raw.includes('Transaction risk unavailable')) {
      return "Transaction risk unavailable because transaction details were not provided.";
    }

    // Strip out stack trace lines if an error object leaked stack info
    const firstLine = raw.split('\n')[0].replace(/Error:\s*/, '');
    return firstLine || fallbackMessage;
  };

  const displayMessage = formatErrorMessage(error);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      padding: '1.25rem 1.5rem',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid #ef4444',
      borderRadius: '10px',
      color: '#f8fafc',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: '700', fontSize: '0.95rem' }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <span>{title}</span>
        </div>
      </div>

      <p style={{
        fontSize: '0.95rem',
        color: '#f8fafc',
        lineHeight: '1.5',
        margin: 0
      }}>
        {displayMessage}
      </p>

      {onRetry && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={onRetry}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#b91c1c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
          >
            <span>🔄</span>
            <span>Retry Request</span>
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Click retry to attempt connecting again
          </span>
        </div>
      )}
    </div>
  );
}
