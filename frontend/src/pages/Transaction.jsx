import React, { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import RiskBadge from '../components/RiskBadge';
import RiskScore from '../components/RiskScore';
import SignalList from '../components/SignalList';
import ExplanationCard from '../components/ExplanationCard';
import RecommendationCard from '../components/RecommendationCard';
import ReportButton from '../components/ReportButton';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { checkTransaction } from '../services/api';

export default function Transaction({ onNavigate }) {
  const [formData, setFormData] = useState({
    amount: 50000,
    payee: 'crypto_escrow_refund@upi',
    is_new_payee: true,
    transaction_hour: 2,
    recent_transaction_count: 8,
    average_transaction_amount: 1200,
    anomaly_note: 'Urgent customs clearance fee and kyc unlock'
  });

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
      let timestamp = undefined;
      if (formData.transaction_hour !== undefined && formData.transaction_hour !== null) {
        const d = new Date();
        d.setUTCHours(Number(formData.transaction_hour), 0, 0, 0);
        timestamp = d.toISOString();
      }

      const payload = {
        payee: formData.payee.trim(),
        amount: Number(formData.amount),
        timestamp: timestamp,
        account_type: formData.payee.includes('@') ? 'upi' : (formData.payee.toLowerCase().includes('crypto') ? 'crypto' : 'bank_transfer'),
        is_first_time: formData.is_new_payee,
        notes: formData.anomaly_note || undefined
      };

      const response = await checkTransaction(payload);
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
  };

  const verdict = result?.verdict || 'Dangerous';
  const riskScore = result?.risk_score ?? 0;
  const reasons = result?.reasons || [];
  const riskFactors = result?.risk_factors || [];

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

      {/* Input Form */}
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

      {/* Result Card */}
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
                {verdict.toLowerCase() === 'dangerous'
                  ? 'High Transaction Risk'
                  : (verdict.toLowerCase() === 'suspicious' ? 'Moderate Transaction Risk' : 'Low Detected Risk')}
              </h3>
            </div>
            <RiskBadge verdict={verdict} />
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
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Anomaly / Memo Note:</span>
                <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>"{formData.anomaly_note}"</span>
              </div>
            )}
          </div>

          {/* RiskScore (All 3 rows, transactionRisk set) */}
          <RiskScore
            score={riskScore}
            messageRisk={null}
            urlRisk={null}
            transactionRisk={riskScore}
          />

          {/* ExplanationCard synthesized from reasons */}
          <ExplanationCard
            reasons={reasons}
            verdict={verdict}
          />

          {/* Risk Factors / Threat Indicators */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <h4 style={{ fontSize: '1rem', color: '#f8fafc', margin: 0 }}>
              Transaction Risk Factors
            </h4>
            <SignalList signals={riskFactors.length > 0 ? riskFactors : reasons} />
          </div>

          {/* RecommendationCard */}
          <RecommendationCard
            verdict={verdict}
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
