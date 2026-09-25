import React, { useState } from 'react';
import ReportForm from '../components/ReportForm';
import CommunityReports from '../components/CommunityReports';

/**
 * Screen D & E Host Page: Reports.jsx
 */
export default function Reports({ initialData = null }) {
  // If navigated with initial pre-filled report data from Screen A/B, open the report tab by default
  const hasPrefilledReport = Boolean(
    initialData?.initialIdentifier || initialData?.identifier || initialData?.url || initialData?.message
  );
  const [activeTab, setActiveTab] = useState(hasPrefilledReport ? 'submit' : 'search');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '780px', margin: '0 auto' }}>
      {/* Title & Introduction */}
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          Community Intelligence & Scam Registry
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>
          Search crowdsourced threat reports before transacting, or contribute new fraudulent numbers, UPI handles, and links to protect others.
        </p>
      </div>

      {/* Tabs for Screen E (Search) & Screen D (Submit) */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          style={{
            backgroundColor: activeTab === 'search' ? '#2563eb' : 'transparent',
            color: activeTab === 'search' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '6px',
            padding: '0.65rem 1.25rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          🔍 Search Registry (Screen E)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submit')}
          style={{
            backgroundColor: activeTab === 'submit' ? '#dc2626' : 'transparent',
            color: activeTab === 'submit' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '6px',
            padding: '0.65rem 1.25rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          🚨 Submit Scam Report (Screen D)
        </button>
      </div>

      {/* Screen E: Community Reports & Registry Search */}
      {activeTab === 'search' && (
        <CommunityReports
          initialQuery={initialData?.initialIdentifier || ''}
        />
      )}

      {/* Screen D: Report Form */}
      {activeTab === 'submit' && (
        <ReportForm
          initialData={initialData}
          initialIdentifier={initialData?.initialIdentifier || ''}
          initialType={initialData?.initialType || ''}
        />
      )}
    </div>
  );
}
