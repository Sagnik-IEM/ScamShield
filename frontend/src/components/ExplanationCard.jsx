import React from 'react';

/**
 * ExplanationCard Component
 * 
 * Synthesizes a plain-English explanation of why the item was flagged
 * from the reasons array and verdict.
 */
export default function ExplanationCard({ reasons = [], signals = [], verdict = 'Safe', text = null }) {
  const items = (reasons && reasons.length > 0) ? reasons : signals;
  const normalizedVerdict = typeof verdict === 'string' ? verdict.toLowerCase() : 'safe';
  const isSafe = normalizedVerdict === 'safe' || (!items || items.length === 0);

  const synthesizeExplanation = () => {
    if (text) return text;

    if (!items || items.length === 0) {
      return "No high-urgency language, lookalike domain patterns, or suspicious payment indicators were detected. The content exhibits standard communication behavior with low risk.";
    }

    // Extract descriptions from reasons (strings or objects)
    const descriptions = items.map((s) => {
      if (typeof s === 'object' && s !== null) {
        return s.description || s.reason || s.factor || 'suspicious pattern';
      }
      return String(s);
    });

    if (descriptions.length === 1) {
      return `This was flagged because ${descriptions[0].charAt(0).toLowerCase() + descriptions[0].slice(1)}.`;
    }

    if (descriptions.length === 2) {
      const first = descriptions[0];
      const second = descriptions[1].charAt(0).toLowerCase() + descriptions[1].slice(1);
      return `This was flagged because ${first}, and ${second}.`;
    }

    // 3 or more reasons
    const head = descriptions.slice(0, -1).join(', ');
    const last = descriptions[descriptions.length - 1].charAt(0).toLowerCase() + descriptions[descriptions.length - 1].slice(1);
    return `This was flagged due to multiple indicators: ${head}, and ${last}.`;
  };

  return (
    <div style={{
      backgroundColor: isSafe ? 'rgba(16, 185, 129, 0.08)' : (normalizedVerdict === 'suspicious' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)'),
      border: `1px solid ${isSafe ? 'rgba(16, 185, 129, 0.3)' : (normalizedVerdict === 'suspicious' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)')}`,
      borderRadius: '10px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{isSafe ? '🛡️' : (normalizedVerdict === 'suspicious' ? '⚠️' : '🔍')}</span>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: '700',
          color: isSafe ? '#10b981' : (normalizedVerdict === 'suspicious' ? '#f59e0b' : '#f87171'),
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
