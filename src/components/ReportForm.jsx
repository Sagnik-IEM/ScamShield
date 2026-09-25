import React, { useState, useEffect } from 'react';
import { submitReport } from '../services/api';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';

/**
 * Screen D: ReportForm Component
 * 
 * Fields:
 * - phone number
 * - UPI ID
 * - URL
 * - sender ID
 * - scam type
 * - description
 * - optional screenshot
 * 
 * On submit:
 * Calls api.js's submitReport and displays "Report submitted." on success.
 * No page reload, no blank intermediate state.
 */
export default function ReportForm({
  initialData = null,
  initialIdentifier = '',
  initialType = '',
  onSuccess
}) {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    upiId: '',
    url: '',
    senderId: '',
    scamType: 'Payment Scam',
    description: '',
    screenshot: null,
    screenshotName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [reportId, setReportId] = useState('');

  // Handle pre-filling from Screen A / B / C navigation
  useEffect(() => {
    const rawId = initialIdentifier || initialData?.initialIdentifier || initialData?.identifier || '';
    const rawType = initialType || initialData?.initialType || initialData?.identifier_type || '';

    if (rawId) {
      setFormData((prev) => {
        const next = { ...prev };
        if (rawType === 'UPI' || rawId.includes('@')) {
          next.upiId = rawId;
        } else if (rawType === 'URL' || rawId.startsWith('http')) {
          next.url = rawId;
        } else if (rawType === 'Phone' || /^\+?\d[\d -]{7,}/.test(rawId)) {
          next.phoneNumber = rawId;
        } else {
          next.senderId = rawId;
        }
        if (initialData?.category) {
          next.scamType = initialData.category;
        }
        return next;
      });
    }
  }, [initialIdentifier, initialType, initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        screenshot: file,
        screenshotName: file.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one identifier is provided
    const hasIdentifier = Boolean(
      formData.phoneNumber.trim() ||
      formData.upiId.trim() ||
      formData.url.trim() ||
      formData.senderId.trim()
    );

    if (!hasIdentifier) {
      setError('Please provide at least one identifier (Phone number, UPI ID, URL, or Sender ID).');
      return;
    }

    setLoading(true);
    setError(null);

    // Determine primary identifier and type for backend schema
    let primaryType = 'UPI';
    let primaryIdentifier = '';

    if (formData.upiId.trim()) {
      primaryType = 'UPI';
      primaryIdentifier = formData.upiId.trim();
    } else if (formData.phoneNumber.trim()) {
      primaryType = 'Phone';
      primaryIdentifier = formData.phoneNumber.trim();
    } else if (formData.url.trim()) {
      primaryType = 'URL';
      primaryIdentifier = formData.url.trim();
    } else if (formData.senderId.trim()) {
      primaryType = 'Sender ID';
      primaryIdentifier = formData.senderId.trim();
    }

    // Build extra details if multiple fields were filled
    const extraDetails = [];
    if (formData.phoneNumber.trim() && primaryType !== 'Phone') extraDetails.push(`Phone: ${formData.phoneNumber.trim()}`);
    if (formData.upiId.trim() && primaryType !== 'UPI') extraDetails.push(`UPI: ${formData.upiId.trim()}`);
    if (formData.url.trim() && primaryType !== 'URL') extraDetails.push(`URL: ${formData.url.trim()}`);
    if (formData.senderId.trim() && primaryType !== 'Sender ID') extraDetails.push(`Sender ID: ${formData.senderId.trim()}`);
    if (formData.screenshotName) extraDetails.push(`Attachment: ${formData.screenshotName}`);

    const fullDescription = extraDetails.length > 0
      ? `${formData.description.trim()}\n[Identifiers: ${extraDetails.join(' | ')}]`.trim()
      : formData.description.trim();

    try {
      const response = await submitReport({
        identifier_type: primaryType,
        identifier: primaryIdentifier,
        category: formData.scamType,
        description: fullDescription || 'Community report submitted by user'
      });

      // Display required exact message on success without page reload
      setSuccessMessage('Report submitted.');
      setReportId(response?.report_id || 'REPORT-001');

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
      phoneNumber: '',
      upiId: '',
      url: '',
      senderId: '',
      scamType: 'Payment Scam',
      description: '',
      screenshot: null,
      screenshotName: ''
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
          Report a Scam to the Community
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          Your report feeds our shared registry to warn and protect other citizens. Identifiers are always masked to protect privacy.
        </p>
      </div>

      {/* Success Notification: Required text "Report submitted." */}
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
                  Reference Case ID: <code>{reportId}</code>
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
        {/* Identifiers Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {/* 1. Phone Number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="e.g. +91 98765 43210"
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

          {/* 2. UPI ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
              UPI ID
            </label>
            <input
              type="text"
              value={formData.upiId}
              onChange={(e) => handleChange('upiId', e.target.value)}
              placeholder="e.g. suspect@upi or scammer@okhdfc"
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

          {/* 3. URL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
              Website URL / Link
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="e.g. https://fake-claim-portal.com"
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

          {/* 4. Sender ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
              Sender ID / Header
            </label>
            <input
              type="text"
              value={formData.senderId}
              onChange={(e) => handleChange('senderId', e.target.value)}
              placeholder="e.g. VM-HDFCBK or AX-LOTTO"
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

        {/* 5. Scam Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
            Scam Type *
          </label>
          <select
            value={formData.scamType}
            onChange={(e) => handleChange('scamType', e.target.value)}
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
            <option value="Payment Scam">Payment Scam (UPI refund lure, fake QR code)</option>
            <option value="Phishing">Phishing (Fake bank login, credential harvesting)</option>
            <option value="Lottery / Prize">Lottery / Prize Scam (KBC, lucky draw lottery)</option>
            <option value="Fake Delivery">Fake Delivery (IndiaPost / FedEx package fee hold)</option>
            <option value="Job Offer">Fake Job Offer (Part-time remote rating, task fraud)</option>
            <option value="Impersonation">Authority Impersonation (Police, CBI, Customs)</option>
            <option value="Loan Fraud">Loan Fraud (Instant credit fee deposit)</option>
          </select>
        </div>

        {/* 6. Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
            Description of the Incident
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what the scammer claimed, how they contacted you, and what action they requested..."
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

        {/* 7. Optional Screenshot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc' }}>
            Optional Screenshot
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem',
            backgroundColor: '#0b1120',
            border: '1px dashed var(--border-color)',
            borderRadius: '8px'
          }}>
            <input
              type="file"
              accept="image/*"
              id="report-screenshot-input"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="report-screenshot-input"
              style={{
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '0.45rem 0.9rem',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              📎 Choose Image
            </label>
            <span style={{ fontSize: '0.85rem', color: formData.screenshotName ? '#f8fafc' : 'var(--text-muted)' }}>
              {formData.screenshotName || 'No file selected (JPG, PNG, WebP)'}
            </span>
            {formData.screenshotName && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, screenshot: null, screenshotName: '' }))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  marginLeft: 'auto'
                }}
              >
                ✕ Remove
              </button>
            )}
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
