import React from 'react';

export const TRANSACTION_PRESETS = [
  {
    id: 'high_risk',
    label: '🚨 High-Risk Late-Night Spike',
    data: {
      amount: 50000,
      payee: 'crypto.escrow@upi',
      is_new_payee: true,
      transaction_hour: 2,
      recent_transaction_count: 8,
      average_transaction_amount: 1200,
      anomaly_note: 'Urgent customs fee and kyc unlock penalty'
    }
  },
  {
    id: 'safe_routine',
    label: '✅ Safe Routine Grocery',
    data: {
      amount: 850,
      payee: 'LocalSupermarket@upi',
      is_new_payee: false,
      transaction_hour: 17,
      recent_transaction_count: 1,
      average_transaction_amount: 900,
      anomaly_note: ''
    }
  },
  {
    id: 'velocity_spike',
    label: '⚠️ Moderate Velocity Spike',
    data: {
      amount: 14250,
      payee: 'quickpay.vendor@upi',
      is_new_payee: true,
      transaction_hour: 14,
      recent_transaction_count: 6,
      average_transaction_amount: 1500,
      anomaly_note: 'Urgent bulk stock invoice'
    }
  }
];

export default function TransactionForm({
  formData = {},
  onChange,
  onPresetSelect
}) {
  const handleChange = (field, value) => {
    if (onChange) {
      onChange({ ...formData, [field]: value });
    }
  };

  const handleApplyPreset = (preset) => {
    if (onPresetSelect) {
      onPresetSelect(preset);
    } else if (onChange) {
      onChange(preset.data);
    }
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
      {/* Presets Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ⚡ Quick Test Scenarios
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {TRANSACTION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              style={{
                backgroundColor: '#0b1120',
                color: '#e2e8f0',
                border: '1px solid var(--border-color)',
                borderRadius: '9999px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.backgroundColor = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = '#0b1120';
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Fields */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Amount */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f8fafc' }}>
            Amount (₹ / $) *
          </label>
          <input
            type="number"
            min="0"
            required
            value={formData?.amount ?? ''}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 50000"
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: '#0b1120',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Payee */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f8fafc' }}>
            Payee Identifier / Name *
          </label>
          <input
            type="text"
            required
            value={formData?.payee || ''}
            onChange={(e) => handleChange('payee', e.target.value)}
            placeholder="e.g. ABC or suspect@upi"
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: '#0b1120',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>

        {/* New Payee? (Yes / No) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f8fafc' }}>
            New Payee?
          </label>
          <select
            value={formData?.is_new_payee ? 'yes' : 'no'}
            onChange={(e) => handleChange('is_new_payee', e.target.value === 'yes')}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: '#0b1120',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="yes">Yes (Never transferred before)</option>
            <option value="no">No (Known payee)</option>
          </select>
        </div>

        {/* Transaction Hour */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f8fafc' }}>
            Transaction Hour (0–23)
          </label>
          <input
            type="number"
            min="0"
            max="23"
            value={formData?.transaction_hour ?? 12}
            onChange={(e) => handleChange('transaction_hour', Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0)))}
            placeholder="0 to 23 (e.g. 2 for 2 AM)"
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: '#0b1120',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Hour of day (2 AM = 2, 2 PM = 14)
          </span>
        </div>

        {/* Recent Transaction Count */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f8fafc' }}>
            Recent Transaction Count
          </label>
          <input
            type="number"
            min="0"
            value={formData?.recent_transaction_count ?? 0}
            onChange={(e) => handleChange('recent_transaction_count', Math.max(0, parseInt(e.target.value, 10) || 0))}
            placeholder="Transfers in past 1 hr"
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: '#0b1120',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Frequency in past hour
          </span>
        </div>

        {/* Average Transaction Amount */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f8fafc' }}>
            Average Transaction Amount
          </label>
          <input
            type="number"
            min="0"
            value={formData?.average_transaction_amount ?? 0}
            onChange={(e) => handleChange('average_transaction_amount', Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="User historical average"
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: '#0b1120',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Normal historical average
          </span>
        </div>
      </div>

      {/* Optional Location / Device Anomaly Note */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f8fafc' }}>
            Location / Device Anomaly Note <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(Optional)</span>
          </label>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Geo-IP, device fingerprint, or VPN flags
          </span>
        </div>
        <textarea
          rows={2}
          value={formData?.anomaly_note || ''}
          onChange={(e) => handleChange('anomaly_note', e.target.value)}
          placeholder="e.g. Login from new city, unrecognized device ID, VPN detected..."
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: '#0b1120',
            color: '#fff',
            fontSize: '0.92rem',
            outline: 'none',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );
}
