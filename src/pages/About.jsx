import React from 'react';

export default function About() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '720px', margin: '0 auto', lineHeight: '1.6' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>About ScamShield</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Transparent, explainable fraud prevention designed for everyday users.
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h3 style={{ fontSize: '1.1rem', color: '#38bdf8' }}>Verdict Thresholds</h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-safe)', fontWeight: 'bold' }}>SAFE (0–29):</span>
            <span>Low detected risk. Normal indicators; always verify unknown recipients independently.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-suspicious)', fontWeight: 'bold' }}>SUSPICIOUS (30–69):</span>
            <span>Elevated risk signals detected. Caution advised before clicking or transferring money.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-dangerous)', fontWeight: 'bold' }}>DANGEROUS (70–100):</span>
            <span>Strong malicious indicators present. Immediate risk of financial or identity theft.</span>
          </li>
        </ul>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h3 style={{ fontSize: '1.1rem', color: '#38bdf8' }}>Core Design Principles</h3>
        <p>
          • <strong>Low detected risk</strong>: We never guarantee 100% safety because threat landscapes continuously evolve.
        </p>
        <p>
          • <strong>Explainable signals</strong>: Every risk score is broken down into plain-language indicators rather than mysterious numeric outputs.
        </p>
        <p>
          • <strong>Privacy preservation</strong>: Identifiers reported to the community database are always masked to protect user privacy.
        </p>
      </div>
    </div>
  );
}
