import { useNavigate } from 'react-router-dom';

export default function OrgNotFound() {
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
      {/* Background blobs */}
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
        maxWidth: 460,
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

        {/* Icon */}
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: 'rgba(245,183,49,.10)',
          border: '1.5px solid rgba(245,183,49,.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 22px',
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18L12 3 3 21z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(245,183,49,.10)', border: '1px solid rgba(245,183,49,.30)',
          borderRadius: 99, padding: '4px 14px', marginBottom: 16,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#D97706' }}>
            Invalid Slug
          </span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 32, fontWeight: 400,
          color: '#060D24', letterSpacing: -0.7,
          lineHeight: 1.1, margin: '0 0 10px',
        }}>
          Organisation{' '}
          <span style={{ fontStyle: 'italic', color: '#1B4FD8' }}>not found</span>
        </h1>

        {/* Description */}
        <p style={{
          fontSize: 13.5, color: '#7A88A8',
          lineHeight: 1.75, fontWeight: 300,
          maxWidth: 300, margin: '0 auto 10px',
        }}>
          No organisation matches this URL slug. Please check the address and try again.
        </p>

        {/* URL hint box */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: 'rgba(59,123,255,.05)', border: '1px solid rgba(59,123,255,.15)',
          borderRadius: 11, padding: '10px 14px',
          margin: '20px 0 28px', textAlign: 'left',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B7BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={{ fontSize: 12, color: '#2E3A5C', lineHeight: 1.6 }}>
            URL format: <span style={{ fontFamily: 'monospace', background: 'rgba(59,123,255,.08)', padding: '1px 6px', borderRadius: 5, fontSize: 11.5, color: '#1B4FD8' }}>app.peopleos.com/<strong>your-org</strong>/login</span>
          </span>
        </div>

        <div style={{ height: 1, background: '#E2E9F7', margin: '0 0 24px' }} />

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '11px 20px',
              background: '#F0F4FC', color: '#2E3A5C',
              border: '1.5px solid #E2E9F7',
              borderRadius: 11, fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#E2E9F7'; e.currentTarget.style.borderColor = '#c8d5ee'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#F0F4FC'; e.currentTarget.style.borderColor = '#E2E9F7'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Go Back
          </button>

        </div>

        {/* Help */}
        <p style={{ fontSize: 12, color: '#7A88A8', margin: '22px 0 0', fontWeight: 300 }}>
          Know your organisation?{' '}
          <a href="#" style={{ color: '#3B7BFF', textDecoration: 'none', fontWeight: 600 }}>
            Contact your admin
          </a>
        </p>
      </div>
    </div>
  );
}
