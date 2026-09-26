import React from 'react';
import RiskScore from '../components/RiskScore';
import RiskBadge from '../components/RiskBadge';
import SignalList from '../components/SignalList';
import ExplanationCard from '../components/ExplanationCard';
import RecommendationCard from '../components/RecommendationCard';
import ReportButton from '../components/ReportButton';
import { mockDangerousMessage } from '../services/api';

export default function Analyze({
  analysisData,
  onNavigate,
  onNewAnalysis
}) {
  const currentResult = analysisData?.result || mockDangerousMessage;
  const currentInput = analysisData?.input || {
    type: 'message',
    message: 'URGENT: Your Chase checking account is suspended. Verify at http://chase-verify.xyz/login immediately!',
    url: 'http://chase-verify.xyz/login'
  };

  const handleBackToInput = () => {
    if (onNewAnalysis) {
      onNewAnalysis();
    } else if (onNavigate) {
      onNavigate('analyze');
    }
  };

  const verdict = currentResult?.verdict || 'Dangerous';
  const overallScore = currentResult?.overall_score ?? currentResult?.risk_score ?? 0;
  const reasons = currentResult?.reasons || [];
  const textRisk = currentResult?.text_risk || null;
  const urlRisk = currentResult?.url_risk || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '780px', margin: '0 auto' }}>
      {/* Top navigation / Back bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleBackToInput}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#38bdf8',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: 0
          }}
        >
          <span>←</span>
          <span>Analyze Another Message or Link</span>
        </button>
      </div>

      {/* Main Result Card */}
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
        {/* Verdict Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.25rem'
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Risk Assessment
            </span>
            <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', margin: '0.2rem 0 0' }}>
              {verdict.toLowerCase() === 'dangerous'
                ? 'High Risk Threat Detected'
                : (verdict.toLowerCase() === 'suspicious' ? 'Suspicious Indicators Detected' : 'Low Detected Risk')}
            </h2>
          </div>
          <RiskBadge verdict={verdict} />
        </div>

        {/* Analyzed Content preview */}
        <div style={{
          backgroundColor: '#0b1120',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Analyzed Content
          </span>
          <p style={{
            fontSize: '0.92rem',
            color: '#e2e8f0',
            lineHeight: '1.4',
            fontStyle: 'italic',
            maxHeight: '100px',
            overflowY: 'auto',
            margin: 0
          }}>
            "{currentInput?.message || currentInput?.url || 'ScamShield input content'}"
          </p>
        </div>

        {/* 1. Risk Score Breakdown (Always 3 rows: Message Risk, URL Risk, Transaction Risk) */}
        <RiskScore
          score={overallScore}
          text_risk={textRisk}
          url_risk={urlRisk}
          transactionRisk={null}
        />

        {/* 2. ExplanationCard: synthesizes plain-English explanation from reasons and verdict */}
        <ExplanationCard
          reasons={reasons}
          verdict={verdict}
        />

        {/* 3. Detected Reasons / Signals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>
            Detected Threat Reasons
          </h3>
          <SignalList reasons={reasons} />
        </div>

        {/* 4. Recommendation Card (Client-side derived from verdict) */}
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
            onClick={handleBackToInput}
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
            ← Check Another
          </button>

          {/* ReportButton pre-filling identifier when available */}
          <ReportButton
            url={currentInput?.url}
            message={currentInput?.message}
            onNavigate={onNavigate}
            label="Report This Scam"
          />
        </div>
      </div>
    </div>
  );
}
