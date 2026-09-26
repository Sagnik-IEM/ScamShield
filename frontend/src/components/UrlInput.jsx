import React from 'react';

export default function UrlInput({
  value = '',
  onChange,
  placeholder = "https://example-suspicious-link.com"
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: '500', color: '#cbd5e1' }}>
          Suspicious Link / URL <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(Optional or bare URL)</span>
        </label>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Domain reputation & lookalike check
        </span>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)', pointerEvents: 'none' }}>
          🔗
        </span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            backgroundColor: '#0b1120',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.75rem 1rem 0.75rem 2.6rem',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            outline: 'none',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#38bdf8';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color)';
          }}
        />
      </div>
    </div>
  );
}
