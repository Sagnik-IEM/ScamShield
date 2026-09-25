import React from 'react';

export default function MessageInput({
  value = '',
  onChange,
  placeholder = "Paste a suspicious SMS, WhatsApp message, email, or payment request..."
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#f8fafc' }}>
          Suspicious Message / Text
        </label>
        {value.length > 0 && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {value.length} characters
          </span>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        style={{
          width: '100%',
          minHeight: '140px',
          backgroundColor: '#0b1120',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '1rem',
          color: 'var(--text-main)',
          fontSize: '1rem',
          lineHeight: '1.5',
          resize: 'vertical',
          outline: 'none',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#38bdf8';
          e.target.style.boxShadow = '0 0 0 2px rgba(56, 189, 248, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-color)';
          e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.3)';
        }}
      />
    </div>
  );
}
