import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#F0F4FC',
      padding: '24px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Subtle background blobs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 50% 50% at 20% 80%, rgba(59,123,255,.06) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 80% 20%, rgba(15,196,196,.05) 0%, transparent 70%)
        `,
      }} />

      <div style={{
        position: 'relative',
        background: '#ffffff',
        borderRadius: 24,
        border: '1.5px solid #E2E9F7',
        boxShadow: '0 4px 24px rgba(13,31,78,.10), 0 1px 4px rgba(13,31,78,.06)',
        padding: '48px 44px 40px',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Top gradient bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #3B7BFF, #0FC4C4, #7EB3FF)',
          borderRadius: '24px 24px 0 0',
        }} />

        {/* Icon circle */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(59,123,255,.12) 0%, rgba(15,196,196,.10) 100%)',
          border: '1.5px solid rgba(59,123,255,.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          {/* Broken link / page icon */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3B7BFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* 404 badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(59,123,255,.08)', border: '1px solid rgba(59,123,255,.18)',
          borderRadius: 99, padding: '4px 14px',
          marginBottom: 16,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3B7BFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#3B7BFF' }}>
            Error 404
          </span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 34, fontWeight: 400,
          color: '#060D24', letterSpacing: -0.8,
          lineHeight: 1.08, margin: '0 0 10px',
        }}>
          Page <span style={{ fontStyle: 'italic', color: '#1B4FD8' }}>not found</span>
        </h1>

        {/* Sub text */}
        <p style={{
          fontSize: 13.5, color: '#7A88A8',
          lineHeight: 1.75, margin: '0 0 32px',
          fontWeight: 300, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto',
        }}>
          The page you're looking for doesn't exist, or the organisation slug is invalid.
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: '#E2E9F7', margin: '0 0 28px' }} />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '11px 20px',
              background: '#F0F4FC',
              color: '#2E3A5C',
              border: '1.5px solid #E2E9F7',
              borderRadius: 11, fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all .2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#E2E9F7'; e.currentTarget.style.borderColor = '#c8d5ee'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#F0F4FC'; e.currentTarget.style.borderColor = '#E2E9F7'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Go Back
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '11px 22px',
              background: 'linear-gradient(135deg, #1B4FD8 0%, #3B7BFF 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 11, fontSize: 13.5, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 5px 20px rgba(59,123,255,.38)',
              transition: 'all .22s',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(59,123,255,.48)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 20px rgba(59,123,255,.38)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go to Home
          </button>
        </div>

        {/* Help link */}
        <p style={{ fontSize: 12, color: '#7A88A8', margin: '24px 0 0', fontWeight: 300 }}>
          Need help?{' '}
          <a href="#" style={{ color: '#3B7BFF', textDecoration: 'none', fontWeight: 600 }}>
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
