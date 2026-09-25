import React, { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import RiskBadge from '../components/RiskBadge';
import RiskScore from '../components/RiskScore';
import SignalList from '../components/SignalList';
import RecommendationCard from '../components/RecommendationCard';
import ReportButton from '../components/ReportButton';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { analyzeTransaction } from '../services/api';

export default function Transaction({ onNavigate }) {
  const [formData, setFormData] = useState({
    amount: 50000,
    payee: 'ABC',
    is_new_payee: true,
    transaction_hour: 2,
    recent_transaction_count: 8,
    average_transaction_amount: 1200,
    anomaly_note: ''
  });

  const [mockVariant, setMockVariant] = useState('DANGEROUS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.payee || !formData.payee.trim()) {
      setError("Please specify a payee identifier or recipient name.");
      return;
    }

    if (formData.amount === undefined || formData.amount === null || formData.amount < 0) {
      setError("Please enter a valid transaction amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeTransaction(formData, mockVariant);
      setResult(response);
    } catch (err) {
      setError(err?.message || "Failed to analyze transaction. Please check inputs and retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const handlePresetSelect = (preset) => {
    setFormData(preset.data);
    setError(null);
    if (preset.id === 'safe_routine') {
      setMockVariant('SAFE');
    } else {
      setMockVariant('DANGEROUS');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '780px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          Transaction Risk Evaluation
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>
          Evaluate financial transfers for behavioral anomalies, payee unfamiliarity, velocity spikes, and timing flags before authorizing payment.
        </p>
      </div>

      {/* Mock Testing Mode Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-card)',
        padding: '0.65rem 1rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        fontSize: '0.85rem'
      }}>
        <span style={{ color: 'var(--text-muted)' }}>Mock Testing Verdict:</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            color: mockVariant === 'DANGEROUS' ? '#ef4444' : 'var(--text-muted)',
            fontWeight: mockVariant === 'DANGEROUS' ? '600' : '400'
          }}>
            <input
              type="radio"
              name="tx_variant"
              value="DANGEROUS"
              checked={mockVariant === 'DANGEROUS'}
              onChange={() => setMockVariant('DANGEROUS')}
            />
            Dangerous Sample
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            color: mockVariant === 'SAFE' ? '#10b981' : 'var(--text-muted)',
            fontWeight: mockVariant === 'SAFE' ? '600' : '400'
          }}>
            <input
              type="radio"
              name="tx_variant"
              value="SAFE"
              checked={mockVariant === 'SAFE'}
              onChange={() => setMockVariant('SAFE')}
            />
            Safe Sample
          </label>
        </div>
      </div>

      {/* Screen C Input Form */}
      {!result && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TransactionForm
            formData={formData}
            onChange={setFormData}
            onPresetSelect={handlePresetSelect}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#1e293b' : '#2563eb',
              color: loading ? '#64748b' : '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.85rem',
              fontSize: '1.05rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              transition: 'background-color 0.2s',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            <span>{loading ? '⏳' : '💳'}</span>
            <span>{loading ? 'Evaluating Transaction Indicators...' : 'Evaluate Transaction Risk'}</span>
          </button>
        </form>
      )}

      {loading && <LoadingState message="ScamShield is analyzing payment velocity, payee history, and financial indicators..." />}
      {error && <ErrorState error={error} onRetry={handleSubmit} />}

      {/* Reusing Screen B Result Components */}
      {result && !loading && (
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
          {/* Header & RiskBadge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1.25rem'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Payment Assessment
              </span>
              <h3 style={{ fontSize: '1.4rem', color: '#f8fafc', margin: '0.2rem 0 0' }}>
                {result.verdict === 'DANGEROUS' ? 'High Transaction Risk' : 'Low Detected Risk'}
              </h3>
            </div>
            <RiskBadge verdict={result.verdict} />
          </div>

          {/* Transaction Summary Card */}
          <div style={{
            backgroundColor: '#0b1120',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            fontSize: '0.85rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Payee:</span>
              <strong style={{ color: '#f8fafc' }}>{formData.payee}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Amount:</span>
              <strong style={{ color: '#38bdf8' }}>₹{formData.amount?.toLocaleString()}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Payee Status:</span>
              <strong style={{ color: formData.is_new_payee ? '#f59e0b' : '#10b981' }}>
                {formData.is_new_payee ? 'New Payee' : 'Known Payee'}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Time:</span>
              <strong style={{ color: '#f8fafc' }}>{formData.transaction_hour}:00</strong>
            </div>
            {formData.anomaly_note && (
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Anomaly Note:</span>
                <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>"{formData.anomaly_note}"</span>
              </div>
            )}
          </div>

          {/* Reused Screen B Component 1: RiskScore (All 3 rows) */}
          <RiskScore
            score={result.risk_score}
            messageRisk={null}
            urlRisk={null}
            transactionRisk={result.risk_score}
          />

          {/* Reused Screen B Component 2: SignalList */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h4 style={{ fontSize: '1rem', color: '#f8fafc', margin: 0 }}>
              Transaction Risk Indicators
            </h4>
            <SignalList signals={result.signals} />
          </div>

          {/* Reused Screen B Component 3: RecommendationCard */}
          <RecommendationCard
            recommendation={
              result.verdict === 'DANGEROUS'
                ? 'High transaction risk detected. Do not authorize this payment or approve 2FA/OTP requests. Verify the recipient through an independent channel before proceeding.'
                : 'Low detected risk. Normal transaction patterns observed. Always verify transfer details before confirming.'
            }
          />

          {/* Bottom Actions with ReportButton */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem'
          }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                backgroundColor: '#334155',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.25rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ← Evaluate Another Transfer
            </button>

            <ReportButton
              identifier={formData.payee}
              identifierType="UPI"
              onNavigate={onNavigate}
              label="Report Suspicious Payee"
            />
          </div>
        </div>
      )}
    </div>
  );
}
