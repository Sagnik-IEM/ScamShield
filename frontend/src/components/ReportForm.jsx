import React, { useState, useEffect } from 'react';
import { reportScam } from '../services/api';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';

/**
 * Screen D: ReportForm Component
 * 
 * Fields matching backend ReportScamRequest:
 * - report_type ('message' | 'url' | 'transaction' | 'other')
 * - content (suspicious message, URL, or payee identifier)
 * - sender (phone, handle, email, or UPI ID)
 * - reported_reason (why this was flagged as a scam)
 * - reporter_email (optional)
 * - risk_score_at_report (optional integer 0-100)
 * 
 * On submit:
 * Calls reportScam and displays "Report submitted." on success.
 */
export default function ReportForm({
  initialData = null,
  initialIdentifier = '',
  initialType = '',
  onSuccess
}) {
  const [formData, setFormData] = useState({
    report_type: 'message',
    content: '',
    sender: '',
    reported_reason: '',
    reporter_email: '',
    risk_score_at_report: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [reportId, setReportId] = useState('');

  // Handle pre-filling from analysis or navigation
  useEffect(() => {
    const rawId = initialIdentifier || initialData?.initialIdentifier || initialData?.identifier || initialData?.url || initialData?.message || '';
    const rawType = initialType || initialData?.initialType || initialData?.type || '';
    const rawScore = initialData?.overall_score ?? initialData?.risk_score ?? initialData?.score ?? null;

    setFormData((prev) => {
      const next = { ...prev };

      // Map pre-filled report_type
      if (rawType) {
        const lower = String(rawType).toLowerCase();
        if (lower.includes('url') || lower.includes('link')) {
          next.report_type = 'url';
        } else if (lower.includes('transaction') || lower.includes('upi') || lower.includes('payment')) {
          next.report_type = 'transaction';
        } else if (lower.includes('message') || lower.includes('sms')) {
          next.report_type = 'message';
        } else {
          next.report_type = 'other';
        }
      }

      if (rawId) {
        next.content = rawId;
        if (rawId.includes('@') || /^\+?\d[\d -]{7,}/.test(rawId)) {
          next.sender = rawId;
        }
      }

      if (rawScore !== null) {
        next.risk_score_at_report = Math.round(Number(rawScore));
      }

      if (initialData?.reasons && Array.isArray(initialData.reasons) && initialData.reasons.length > 0) {
        next.reported_reason = `Flagged indicators: ${initialData.reasons.join('; ')}`;
      }

      return next;
    });
  }, [initialIdentifier, initialType, initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedContent = formData.content.trim();
    const trimmedReason = formData.reported_reason.trim();

    if (!trimmedContent || trimmedContent.length < 3) {
      setError('Please provide the suspicious content, URL, or payee (at least 3 characters).');
      return;
    }

    if (!trimmedReason || trimmedReason.length < 3) {
      setError('Please specify the reason why this is suspicious (at least 3 characters).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        report_type: formData.report_type,
        content: trimmedContent,
        sender: formData.sender.trim() || null,
        reported_reason: trimmedReason,
        reporter_email: formData.reporter_email.trim() || null,
        risk_score_at_report: formData.risk_score_at_report !== null ? Number(formData.risk_score_at_report) : null
      };

      const response = await reportScam(payload);

      setSuccessMessage('Report submitted.');
      setReportId(response?.report_id || '');

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      report_type: 'message',
      content: '',
      sender: '',
      reported_reason: '',
      reporter_email: '',
      risk_score_at_report: null
    });
    setSuccessMessage('');
    setError(null);
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
          Report a Scam to Community Threat Intelligence
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          Contribute new scam messages, phishing URLs, or fraudulent payment handles. Sensitive account data is automatically sanitized.
        </p>
      </div>

      {/* Success Notification: "Report submitted." */}
      {successMessage && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--color-safe)',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#f8fafc',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>✅</span>
            <div>
              <strong style={{ color: 'var(--color-safe)', fontSize: '1rem' }}>
                {successMessage}
              </strong>
              {reportId && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Database Report ID: <code>#{reportId}</code>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-safe)',
              color: 'var(--color-safe)',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Submit Another Report
          </button>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top row: report_type & sender */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {/* 1. Report Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
              Report Category *
            </label>
            <select
              value={formData.report_type}
              onChange={(e) => handleChange('report_type', e.target.value)}
              style={{
                padding: '0.7rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#0b1120',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="message">SMS / Email / WhatsApp Message</option>
              <option value="url">Phishing Link / Malicious Website</option>
              <option value="transaction">Fraudulent UPI / Bank Transfer / Payee</option>
              <option value="other">Other Fraud / Impersonation</option>
            </select>
          </div>

          {/* 2. Sender */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
              Sender Phone / Handle / UPI ID <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.sender}
              onChange={(e) => handleChange('sender', e.target.value)}
              placeholder="e.g. +18005550199 or suspect@upi"
              style={{
                padding: '0.7rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#0b1120',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* 3. Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
            Suspicious Content / URL / Payment Reference *
          </label>
          <textarea
            rows={3}
            required
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Paste the suspicious text, link, or transaction details here..."
            style={{
              padding: '0.7rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#0b1120',
              color: '#fff',
              fontSize: '0.92rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        {/* 4. Reported Reason */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
            Why was this flagged as a scam? *
          </label>
          <input
            type="text"
            required
            value={formData.reported_reason}
            onChange={(e) => handleChange('reported_reason', e.target.value)}
            placeholder="e.g. Fake lottery winning SMS demanding advance fee verification"
            style={{
              padding: '0.7rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#0b1120',
              color: '#fff',
              fontSize: '0.92rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Bottom row: reporter_email & risk_score_at_report */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {/* 5. Reporter Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
              Your Email <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(Optional)</span>
            </label>
            <input
              type="email"
              value={formData.reporter_email}
              onChange={(e) => handleChange('reporter_email', e.target.value)}
              placeholder="user@example.com"
              style={{
                padding: '0.7rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#0b1120',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
          </div>

          {/* 6. Risk Score At Report */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
              Scan Risk Score <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(Optional 0–100)</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.risk_score_at_report ?? ''}
              onChange={(e) => handleChange('risk_score_at_report', e.target.value ? parseInt(e.target.value, 10) : null)}
              placeholder="e.g. 92"
              style={{
                padding: '0.7rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#0b1120',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {error && <ErrorState error={error} onRetry={handleSubmit} />}
        {loading && <LoadingState message="Submitting scam report to community registry..." />}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? '#7f1d1d' : '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.85rem',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
            transition: 'background-color 0.2s ease'
          }}
        >
          <span>{loading ? '⏳' : '🚨'}</span>
          <span>{loading ? 'Submitting Report...' : 'Submit Report'}</span>
        </button>
      </form>
    </div>
  );
}
