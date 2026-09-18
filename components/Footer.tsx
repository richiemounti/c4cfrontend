'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Linkedin } from 'lucide-react';
import { FC, type MouseEvent } from 'react';

const quickLinks = [
  { href: 'https://www.connectgo.co.uk/faq', label: 'Frequently Asked Questions', external: true },
  { href: 'https://www.citizens4change.net/', label: 'Genesis & Track Record', external: true },
  { href: '/terms', label: 'Terms of Service', external: false },
  { href: '/privacy', label: 'Privacy Policy', external: false },
];

const Footer: FC = () => {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  // On the homepage, reopen the actual cookie banner in place (it already
  // listens for this event — see app/page.tsx) instead of navigating away.
  // Anywhere else, send people to the standalone preferences page.
  const handleCookieSettingsClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isHomepage) {
      e.preventDefault();
      window.dispatchEvent(new Event('cookiePreferencesCleared'));
    }
  };

  return (
    <footer style={{ background: '#00415a', padding: '3rem 0' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 2.5rem' }}>
        {/* Top row — logo, address, quick links */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,0.9fr)',
            gap: '2.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
          }}
          className="footer-grid"
        >
          <div>
            <Image
              src="/logos/Primary logo_white.png"
              alt="Citizens for Change"
              width={210}
              height={91}
              style={{ width: 'clamp(160px, 17vw, 210px)', height: 'auto', marginBottom: 16 }}
            />
            <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.88)', marginBottom: 14 }}>
              Powered by <span style={{ fontWeight: 700 }}>@ConnectGo</span>
            </p>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Citizens for Change on LinkedIn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)',
                color: '#fff',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ff6b58'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
            >
              <Linkedin size={16} />
            </a>
          </div>

          <address style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,0.78)', fontStyle: 'normal' }}>
            <em>ConnectGo trades under the brand Citizens for Change.</em><br />
            8B Neville Terrace, Tunbridge Wells, Kent, United Kingdom, TN2 5QY.<br />
            Reg. 11200005
          </address>

          <nav aria-label="Quick links">
            <p style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase',
              color: '#fff', margin: '0 0 16px',
            }}>
              Quick Links
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {quickLinks.map(({ href, label, external }) => (
                <li key={href} style={{ marginBottom: 12 }}>
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.60)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f7dc88')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.60)')}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.60)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f7dc88')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.60)')}
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link
                  href="/cookie-preferences"
                  onClick={handleCookieSettingsClick}
                  style={{ fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.60)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f7dc88')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.60)')}
                >
                  Cookie Settings
                </Link>
              </li>
            </ul>
          </nav>
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
              onMouseEnter={e => (e.currentTarget.style.color = '#f7dc88')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.40)')}
            >
              @connectgo
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 720px) {
          .footer-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
