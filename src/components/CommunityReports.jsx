import React, { useState, useEffect } from 'react';
import { searchReports } from '../services/api';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';

/**
 * Privacy Rule Helper:
 * Truncate or mask any identifier shown (e.g. only the first few characters + asterisks)
 * rather than the full raw value -- mirroring backend privacy principles.
 */
export function maskIdentifier(identifier) {
  if (!identifier || typeof identifier !== 'string') return '';
  const trimmed = identifier.trim();

  // 1. UPI or Email address (e.g. "suspect@upi" -> "su***ct@upi")
  if (trimmed.includes('@')) {
    const [name, domain] = trimmed.split('@');
    if (name.length <= 3) {
      return `${name[0]}***@${domain}`;
    }
    const start = name.slice(0, 2);
    const end = name.slice(-2);
    return `${start}***${end}@${domain}`;
  }

  // 2. URLs (e.g. "https://phishing-site.com/login" -> "https://phish*****.com")
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname;
      const parts = host.split('.');
      if (parts.length >= 2) {
        const main = parts[0];
        const maskedMain = main.length > 4 ? `${main.slice(0, 3)}****` : `${main[0]}***`;
        return `${parsed.protocol}//${maskedMain}.${parts.slice(1).join('.')}`;
      }
      return `${parsed.protocol}//${host.slice(0, 4)}****`;
    } catch {
      return `${trimmed.slice(0, 8)}****`;
    }
  }

  // 3. Phone numbers or raw alphanumeric IDs (e.g. "+91-9876543210" -> "+91-987****10")
  if (trimmed.length <= 4) {
    return `${trimmed.slice(0, 1)}***`;
  }

  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-2);
  return `${prefix}****${suffix}`;
}

/**
 * Calculates human-readable report frequency
 */
export function getReportFrequency(count) {
  if (!count || count <= 0) return 'No activity recorded';
  if (count >= 10) return 'Critical frequency (Surge detected in past 24 hours)';
  if (count >= 5) return 'High frequency (Multiple reports logged this week)';
  if (count >= 2) return 'Moderate frequency (Recurring reports)';
  return 'Low frequency (First logged report)';
}

/**
 * Screen E: Community Intelligence Database Component
 */
export default function CommunityReports({
  initialQuery = '',
  searchResult: externalResult = null
}) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(externalResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mockVariant, setMockVariant] = useState('DANGEROUS');

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (externalResult) {
      setResult(externalResult);
    }
  }, [externalResult]);

  const handleSearch = async (searchTerm) => {
    const target = searchTerm !== undefined ? searchTerm : query;
    if (!target || !target.trim()) {
      setError('Please enter a phone number, UPI ID, or URL to search.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await searchReports(target.trim(), mockVariant);
      setResult(res);
    } catch (err) {
      setError(err?.message || 'Failed to search community database.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (presetTerm, variant) => {
    setQuery(presetTerm);
    setMockVariant(variant);
    handleSearch(presetTerm);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.75rem',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🛡️</span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
            Community Threat Registry
          </h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          Verify if an unfamiliar number, UPI handle, or website link has already been reported by other users.
        </p>
      </div>

      {/* Preset Buttons for Judges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Quick Test Search Presets:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handleApplyPreset('example@upi', 'DANGEROUS')}
            style={{
              backgroundColor: '#0b1120',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            🚨 example@upi (Reported)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('+91-9876543210', 'DANGEROUS')}
            style={{
              backgroundColor: '#0b1120',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            🚨 +91-9876543210 (Reported)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('safe-merchant@upi', 'SAFE')}
            style={{
              backgroundColor: '#0b1120',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            ✅ safe-merchant@upi (Clean)
          </button>
        </div>
      </div>

      {/* Search Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        style={{ display: 'flex', gap: '0.75rem' }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search phone number, UPI ID, domain, or sender..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            backgroundColor: '#0b1120',
            color: '#fff',
            fontSize: '0.95rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading && <LoadingState message="Querying community threat registry..." />}
      {error && <ErrorState error={error} onRetry={() => handleSearch()} />}

      {/* Screen E: Display Results */}
      {result && !loading && (
        <div style={{
          backgroundColor: '#0b1120',
          border: `1px solid ${result.reported ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
          borderRadius: '10px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {/* Status Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{result.reported ? '🚨' : '✅'}</span>
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '700',
                color: result.reported ? '#f87171' : 'var(--color-safe)',
                margin: 0
              }}>
                {result.reported ? 'Match Found in Threat Registry' : 'No Reports Found (Clean)'}
              </h4>
            </div>

            <span style={{
              backgroundColor: result.reported ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: result.reported ? '#ef4444' : 'var(--color-safe)',
              border: `1px solid ${result.reported ? '#ef4444' : 'var(--color-safe)'}`,
              borderRadius: '9999px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              {result.reported ? `${result.report_count} Reports Logged` : '0 Reports'}
            </span>
          </div>

          {/* Details Grid: Displaying all 4 required points */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem'
          }}>
            {/* 1. Reported Identifiers (Masked for Privacy) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Reported Identifier (Masked)
              </span>
              <strong style={{ fontSize: '1rem', color: '#f8fafc', fontFamily: 'monospace' }}>
                {maskIdentifier(query)}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                🔒 Raw identifier is masked for privacy
              </span>
            </div>

            {/* 2. Number of Reports */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Incident Reports
              </span>
              <strong style={{ fontSize: '1.1rem', color: result.reported ? '#f87171' : 'var(--color-safe)' }}>
                {result.report_count || 0} community reports
              </strong>
            </div>

            {/* 3. Scam Category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Scam Category
              </span>
              <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>
                {result.category || (result.reported ? 'General Fraud' : 'None detected')}
              </strong>
            </div>

            {/* 4. Report Frequency */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Report Frequency & Urgency
              </span>
              <strong style={{ fontSize: '0.95rem', color: result.reported ? '#fbbf24' : 'var(--text-muted)' }}>
                {getReportFrequency(result.report_count)}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
