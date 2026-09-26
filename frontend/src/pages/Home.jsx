import React, { useState, useEffect } from 'react';
import MessageInput from '../components/MessageInput';
import UrlInput from '../components/UrlInput';
import AnalyzeButton from '../components/AnalyzeButton';
import QuickFillButtons from '../components/QuickFillButtons';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { checkMessage } from '../services/api';

export default function Home({
  onNavigate,
  onAnalysisComplete,
  savedInput = { message: '', url: '', activePresetId: null },
  onInputChange
}) {
  const [message, setMessage] = useState(savedInput?.message || '');
  const [url, setUrl] = useState(savedInput?.url || '');
  const [activePresetId, setActivePresetId] = useState(savedInput?.activePresetId || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync internal state if savedInput updates externally
  useEffect(() => {
    if (savedInput) {
      if (savedInput.message !== undefined && savedInput.message !== message) {
        setMessage(savedInput.message);
      }
      if (savedInput.url !== undefined && savedInput.url !== url) {
        setUrl(savedInput.url);
      }
      if (savedInput.activePresetId !== undefined && savedInput.activePresetId !== activePresetId) {
        setActivePresetId(savedInput.activePresetId);
      }
    }
  }, [savedInput]);

  const updateInputs = (nextMessage, nextUrl, nextPresetId) => {
    setMessage(nextMessage);
    setUrl(nextUrl);
    setActivePresetId(nextPresetId);
    if (onInputChange) {
      onInputChange({
        message: nextMessage,
        url: nextUrl,
        activePresetId: nextPresetId
      });
    }
  };

  const handleSelectPreset = (sample) => {
    const nextUrl = sample.url || '';
    updateInputs(sample.message, nextUrl, sample.id);
    setError(null);
  };

  const handleMessageChange = (val) => {
    updateInputs(val, url, null);
  };

  const handleUrlChange = (val) => {
    updateInputs(message, val, null);
  };

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    let trimmedUrl = url.trim();

    if (!trimmedMessage && !trimmedUrl) {
      setError("Please paste a suspicious message or enter a URL to analyze.");
      return;
    }

    // Auto-detect embedded URL in message if URL field was not explicitly provided
    if (!trimmedUrl && trimmedMessage) {
      const match = trimmedMessage.match(/https?:\/\/[^\s]+/i);
      if (match) {
        trimmedUrl = match[0].replace(/[.,;!?)]+$/, '');
      }
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        message: trimmedMessage || trimmedUrl,
        urls: trimmedUrl ? [trimmedUrl] : undefined
      };

      const result = await checkMessage(payload);

      const analysisData = {
        result,
        input: {
          type: trimmedMessage ? 'message' : 'url',
          message: trimmedMessage,
          url: trimmedUrl
        }
      };

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisData);
      } else if (onNavigate) {
        onNavigate('result', analysisData);
      }
    } catch (err) {
      setError(err?.message || "Failed to analyze input. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    updateInputs('', '', null);
    setError(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '780px', margin: '0 auto' }}>
      {/* Hero header */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Real-Time Scam Detection
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          Paste a suspicious message, email, or bare link to detect fraud patterns, phishing links, and urgent coercion.
        </p>
      </div>

      {/* Screen A Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Quick Fill Presets */}
        <QuickFillButtons onSelect={handleSelectPreset} activeId={activePresetId} />

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <MessageInput
            value={message}
            onChange={handleMessageChange}
            placeholder="Paste a suspicious SMS, WhatsApp message, email, or payment request..."
          />

          <UrlInput
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example-suspicious-link.com"
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <AnalyzeButton
              message={message}
              url={url}
              loading={loading}
              onClick={handleSubmit}
            />
          </div>
          {(message || url) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.85rem 1.25rem',
                fontSize: '0.95rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>

        {error && <ErrorState error={error} onRetry={handleSubmit} />}
        {loading && <LoadingState message="ScamShield is analyzing message content, threat signals, and domain reputation..." />}
      </div>
    </div>
  );
}
