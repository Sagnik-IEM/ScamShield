import React, { useState } from 'react';
import RiskScore from '../components/RiskScore';
import RiskBadge from '../components/RiskBadge';
import SignalList from '../components/SignalList';
import ExplanationCard from '../components/ExplanationCard';
import RecommendationCard from '../components/RecommendationCard';
import ReportButton from '../components/ReportButton';
import { mockDangerousMessage, mockSafeMessage, mockDangerousUrl, mockSafeUrl } from '../services/api';

export default function Analyze({
  analysisData,
  onNavigate,
  onNewAnalysis
}) {
  // If navigated without data, default to dangerous mock for demonstration
  const [currentResult, setCurrentResult] = useState(
    analysisData?.result || mockDangerousMessage
  );
  const [currentInput, setCurrentInput] = useState(
    analysisData?.input || {
      type: 'message',
      message: 'Dear Customer, your SBI account ending in 5021 is blocked due to an incomplete KYC profile. Please update your Aadhaar and PAN immediately at https://sbi-kyc-reactivate-portal.com to restore banking services.',
      url: 'https://sbi-kyc-reactivate-portal.com'
    }
  );

  const isUrlAnalysis = currentInput?.type === 'url' || Boolean(!currentInput?.message && currentInput?.url);

  const handleToggleFixture = (variant) => {
    if (variant === 'SAFE') {
      setCurrentResult(isUrlAnalysis ? mockSafeUrl : mockSafeMessage);
    } else {
      setCurrentResult(isUrlAnalysis ? mockDangerousUrl : mockDangerousMessage);
    }
  };

  const handleBackToInput = () => {
    if (onNewAnalysis) {
      onNewAnalysis();
    } else if (onNavigate) {
      onNavigate('analyze');
    }
  };

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

        {/* Live fixture switcher for judges */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.35rem 0.75rem',
          borderRadius: '6px',
          fontSize: '0.8rem',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Verdict View:</span>
          <button
            type="button"
            onClick={() => handleToggleFixture('DANGEROUS')}
            style={{
              backgroundColor: currentResult.verdict === 'DANGEROUS' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              color: currentResult.verdict === 'DANGEROUS' ? '#ef4444' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Dangerous
          </button>
          <button
            type="button"
            onClick={() => handleToggleFixture('SAFE')}
            style={{
              backgroundColor: currentResult.verdict === 'SAFE' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: currentResult.verdict === 'SAFE' ? '#10b981' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Safe
          </button>
        </div>
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
              {currentResult.verdict === 'DANGEROUS' ? 'Threat Detected' : 'Low Detected Risk'}
            </h2>
          </div>
          <RiskBadge verdict={currentResult.verdict} />
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
            Analyzed {isUrlAnalysis ? 'URL' : 'Content'}
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
            "{currentInput?.message || currentInput?.url || currentResult.domain}"
          </p>
        </div>

        {/* 1. Risk Score Breakdown (Always 3 rows: Message Risk, URL Risk, Transaction Risk) */}
        <RiskScore
          score={currentResult.risk_score}
          messageRisk={currentResult.text_analysis?.score ?? null}
          urlRisk={currentResult.url_analysis?.score ?? (isUrlAnalysis ? currentResult.risk_score : null)}
          transactionRisk={currentResult.transaction_analysis?.score ?? null}
        />

        {/* 2. ExplanationCard: short paragraph synthesizing why item was flagged built from signals */}
        <ExplanationCard
          signals={currentResult.signals}
          verdict={currentResult.verdict}
        />

        {/* 3. Detected Signals: plain language description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0 }}>
            Identified Threat Signals
          </h3>
          <SignalList signals={currentResult.signals} />
        </div>

        {/* 4. Recommendation Card */}
        <RecommendationCard
          recommendation={
            currentResult.recommendation ||
            (currentResult.verdict === 'DANGEROUS'
              ? 'Do not click any embedded links, enter passwords, or transfer funds. Report this incident to prevent others from falling victim.'
              : 'Low detected risk. Always confirm the identity of unknown senders through trusted channels.')
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
