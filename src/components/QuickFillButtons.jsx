import React from 'react';

export const QUICK_FILL_SAMPLES = [
  {
    id: 'bank',
    category: 'Bank Impersonation',
    icon: '🏦',
    message: 'Dear Customer, your SBI account ending in 5021 is blocked due to an incomplete KYC profile. Please update your Aadhaar and PAN immediately at https://sbi-kyc-reactivate-portal.com to restore banking services. Failure to verify within 24 hours will result in permanent account termination.',
    url: 'https://sbi-kyc-reactivate-portal.com'
  },
  {
    id: 'delivery',
    category: 'Fake Delivery',
    icon: '📦',
    message: 'BlueDart Express Alert: Your parcel could not be delivered due to an incorrect postal address. A redelivery fee of ₹48 is required to release your package from the regional hub. Update your address and confirm delivery here: https://bluedart-package-tracking.online/reschedule',
    url: 'https://bluedart-package-tracking.online/reschedule'
  },
  {
    id: 'prize',
    category: 'Prize Scam',
    icon: '🎉',
    message: 'Congratulations! Your mobile number has been selected as the grand winner of the 2026 Kaun Banega Crorepati WhatsApp Lucky Draw worth ₹25,00,000. To claim your cash prize directly in your bank account, send your claim code KBC-992 and processing fee to lottery-desk@upi today.',
    url: ''
  },
  {
    id: 'upi',
    category: 'UPI / Payment Scam',
    icon: '💳',
    message: 'Urgent: You received a cashback refund of ₹4,500 from Google Pay for failed transaction ID 883921. Click Accept and enter your UPI PIN on the link https://gpay-cashback-instant.net to transfer the refund into your linked bank account.',
    url: 'https://gpay-cashback-instant.net'
  },
  {
    id: 'job',
    category: 'Job Scam',
    icon: '💼',
    message: 'Amazon HR Recruitment: You have been selected for a part-time remote work opportunity earning ₹3,500 to ₹7,000 per day by rating products online. Work only 30 minutes daily from your mobile phone with guaranteed instant daily payouts. Contact our recruitment officer on WhatsApp at +91-9871234567 to start today.',
    url: ''
  }
];

export default function QuickFillButtons({ onSelect, activeId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ⚡ Instant Test Scenarios (1-Click Pre-fill)
        </span>
        <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
          Click any preset to test
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        {QUICK_FILL_SAMPLES.map((sample) => {
          const isSelected = activeId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelect(sample)}
              style={{
                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-card)',
                color: isSelected ? '#38bdf8' : '#e2e8f0',
                border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                borderRadius: '9999px',
                padding: '0.45rem 0.9rem',
                fontSize: '0.85rem',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#64748b';
                  e.currentTarget.style.backgroundColor = '#1e293b';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                }
              }}
            >
              <span>{sample.icon}</span>
              <span>{sample.category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
