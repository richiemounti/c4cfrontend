import Link from 'next/link';
import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer style={{ background: '#1a1814', padding: '3rem 0' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 2.5rem' }}>
        {/* Top row — brand + social */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-rajdhani), sans-serif',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.03em',
              color: '#fff',
            }}
          >
            Citizens for{' '}
            <span className="c4c-grad-text">Change</span>
          </span>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {[
              { href: '#', label: 'LinkedIn' },
              { href: '#', label: 'Instagram' },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.45)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f2c539')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Mid row — links */}
        <div
          style={{
            display: 'flex',
            gap: '2.5rem',
            flexWrap: 'wrap',
            padding: '1.75rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          {[
            { href: '/terms', label: 'Terms of Service' },
            { href: '/privacy', label: 'Privacy Policy' },
            { href: '/support', label: 'Frequently Asked Questions' },
            { href: '/#who', label: 'Our Genesis & Track Record' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.35)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.70)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Bottom row — copyright */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.5rem',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 300, color: 'rgba(255,255,255,0.25)' }}>
            Copyright &copy; 2026 ConnectGo. All Rights Reserved.
          </p>
          <p style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>
            Powered by{' '}
            <a
              href="https://www.connectgo.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.40)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f2c539')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.40)')}
            >
              @connectgo
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
