import React from 'react';

export default function Header({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'analyze', label: 'Analyze' },
    { id: 'reports', label: 'Reports' },
    { id: 'transaction', label: 'Transaction' }
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        onClick={() => onNavigate && onNavigate('analyze')}
        title="ScamShield Home"
      >
        <span style={{ fontSize: '1.6rem' }}>🛡️</span>
        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8', letterSpacing: '-0.02em' }}>
          ScamShield
        </span>
      </div>

      <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {navItems.map((item) => {
          const isActive = currentPage === item.id || (item.id === 'analyze' && (currentPage === 'home' || currentPage === 'result'));
          return (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              style={{
                background: isActive ? '#334155' : 'transparent',
                color: isActive ? '#38bdf8' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.95rem',
                transition: 'all 0.15s ease'
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
