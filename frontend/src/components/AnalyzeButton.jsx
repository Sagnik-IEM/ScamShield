import React from 'react';
import { checkMessage } from '../services/api';

export default function AnalyzeButton({
  message = '',
  url = '',
  loading = false,
  disabled = false,
  variant = 'Dangerous',
  onClick,
  onResult,
  onError,
  label
}) {
  const hasMessage = Boolean(message && message.trim().length > 0);
  const hasUrl = Boolean(url && url.trim().length > 0);
  const isDisabled = disabled || loading || (!hasMessage && !hasUrl && !onClick);

  const handleClick = async (e) => {
    if (onClick) {
      onClick(e);
      return;
    }

    if (isDisabled) return;

    try {
      const trimmedMsg = message.trim();
      const trimmedUrl = url.trim();

      const result = await checkMessage({
        message: trimmedMsg || trimmedUrl,
        urls: trimmedUrl ? [trimmedUrl] : undefined
      }, variant);

      if (onResult) {
        onResult(result, {
          type: hasMessage ? 'message' : 'url',
          input: hasMessage ? message : url,
          url: hasUrl ? url : null
        });
      }
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        console.error('Analysis error:', err);
      }
    }
  };

  const getButtonText = () => {
    if (loading) return 'Scanning Threat Signals...';
    if (label) return label;
    if (!hasMessage && hasUrl) return 'Scan Bare URL';
    return 'Scan & Analyze Risk';
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        width: '100%',
        backgroundColor: isDisabled ? '#1e293b' : '#2563eb',
        color: isDisabled ? '#64748b' : '#ffffff',
        border: isDisabled ? '1px solid #334155' : '1px solid #3b82f6',
        borderRadius: '8px',
        padding: '0.85rem 1.75rem',
        fontSize: '1.05rem',
        fontWeight: '700',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        transition: 'all 0.2s ease',
        boxShadow: isDisabled ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.25)'
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.backgroundColor = '#1d4ed8';
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) e.currentTarget.style.backgroundColor = '#2563eb';
      }}
    >
      <span>{loading ? '⏳' : '🛡️'}</span>
      <span>{getButtonText()}</span>
    </button>
  );
}
