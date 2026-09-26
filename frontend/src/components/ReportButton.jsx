import React from 'react';

/**
 * Helper to extract the most relevant identifier (URL, UPI, or Phone) from input
 */
export function extractIdentifier(url, message) {
  if (url && typeof url === 'string' && url.trim().length > 0) {
    return {
      identifier: url.trim(),
      type: 'URL'
    };
  }

  if (message && typeof message === 'string') {
    // 1. Look for embedded URLs
    const urlMatch = message.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      return {
        identifier: urlMatch[0].replace(/[.,;!?)]+$/, ''),
        type: 'URL'
      };
    }

    // 2. Look for UPI IDs (e.g., lottery-desk@upi, user@okhdfcbank)
    const upiMatch = message.match(/[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}/);
    if (upiMatch && !upiMatch[0].includes('.com') && !upiMatch[0].includes('.org')) {
      return {
        identifier: upiMatch[0],
        type: 'UPI'
      };
    }

    // 3. Look for Phone numbers (e.g., +91-98234-56789, +1234567890)
    const phoneMatch = message.match(/(\+?\d{1,4}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
    if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
      return {
        identifier: phoneMatch[0].trim(),
        type: 'Phone'
      };
    }
  }

  return {
    identifier: '',
    type: 'URL'
  };
}

/**
 * ReportButton Component
 * 
 * Requirement 4:
 * Links to the Report screen, pre-filling the identifier (URL or phone/UPI) when one is available.
 */
export default function ReportButton({
  url = '',
  message = '',
  identifier = '',
  identifierType = '',
  onNavigate,
  onClick,
  label = 'Report This Scam'
}) {
  const extracted = (identifier && identifierType)
    ? { identifier, type: identifierType }
    : extractIdentifier(url, message);

  const handleClick = (e) => {
    if (onClick) {
      onClick(e, extracted);
      return;
    }

    if (onNavigate) {
      onNavigate('reports', {
        initialIdentifier: extracted.identifier,
        initialType: extracted.type
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        backgroundColor: '#dc2626',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem 1.25rem',
        fontSize: '0.95rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#b91c1c';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#dc2626';
      }}
    >
      <span>🚨</span>
      <span>{label}</span>
      {extracted.identifier && (
        <span style={{
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          padding: '0.15rem 0.45rem',
          borderRadius: '4px',
          fontSize: '0.78rem',
          fontWeight: '500',
          maxWidth: '140px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {extracted.type}: {extracted.identifier}
        </span>
      )}
    </button>
  );
}
