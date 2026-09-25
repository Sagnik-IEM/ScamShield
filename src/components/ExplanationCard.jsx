import React from 'react';

/**
 * ExplanationCard Component
 * 
 * Requirement 4:
 * A short paragraph synthesizing why the item was flagged, built from the signals array.
 */
export default function ExplanationCard({ signals = [], verdict = 'SAFE', text = null }) {
  const synthesizeExplanation = () => {
    if (text) return text;

    if (!signals || signals.length === 0) {
      return "No urgency tactics, fraudulent links, or coercive payment requests were detected in this analysis. The content exhibits standard communication patterns with low detected risk.";
    }

    // Extract descriptions from signal objects or strings
    const descriptions = signals.map((s) => {
      if (typeof s === 'object' && s !== null) {
        return s.description || s.type;
      }
      return String(s);
    });

    if (descriptions.length === 1) {
      return `This item was flagged because ${descriptions[0].charAt(0).toLowerCase() + descriptions[0].slice(1)}.`;
    }

    if (descriptions.length === 2) {
      const first = descriptions[0];
      const second = descriptions[1].charAt(0).toLowerCase() + descriptions[1].slice(1);
      return `This item was flagged because ${first}, and ${second}.`;
    }

    // 3 or more signals
    const head = descriptions.slice(0, -1).join(', ');
    const last = descriptions[descriptions.length - 1].charAt(0).toLowerCase() + descriptions[descriptions.length - 1].slice(1);
    return `This item was flagged due to multiple indicators: ${head}, and ${last}.`;
  };

  const isSafe = verdict === 'SAFE' || (signals && signals.length === 0);

  return (
    <div style={{
      backgroundColor: isSafe ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
      border: `1px solid ${isSafe ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
      borderRadius: '10px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{isSafe ? '🛡️' : '🔍'}</span>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: '700',
          color: isSafe ? '#10b981' : '#f87171',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          margin: 0
        }}>
          {isSafe ? 'Why is this considered low risk?' : 'Why was this flagged?'}
        </h4>
      </div>

      <p style={{
        color: '#f8fafc',
        fontSize: '0.95rem',
        lineHeight: '1.6',
        margin: 0
      }}>
        {synthesizeExplanation()}
      </p>
    </div>
  );
}
