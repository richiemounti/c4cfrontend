'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Linkedin } from 'lucide-react';
import { FC, type CSSProperties, type MouseEvent } from 'react';

const quickLinks = [
  { href: 'https://www.connectgo.co.uk/faq', label: 'Frequently Asked Questions', external: true },
  { href: 'https://www.citizens4change.net/', label: 'Genesis & Track Record', external: true },
  { href: '/terms', label: 'Terms of Service', external: false },
  { href: '/privacy', label: 'Privacy Policy', external: false },
];

// Same treatment as the header's nav links (components/Navbar.tsx
// navLinkStyle) — Space Grotesk, same size, rather than the Plex Sans
// semi-bold the brand pass otherwise specifies for footer links.
const footerLinkStyle: CSSProperties = {
  fontFamily: 'var(--font-space-grotesk), sans-serif',
  fontWeight: 700,
  fontSize: 12.5,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#fff',
  textDecoration: 'none',
  transition: 'text-decoration 0.15s',
};

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
      {/* Same max-width/gutter as the header (Navbar.tsx) and the homepage's
          .wrap, so the footer's right edge lines up with the nav and the
          content above it instead of running narrower. */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(20px, 5vw, 48px)' }}>
        {/* Order: logo + "Powered by ConnectGo" + LinkedIn mark (stacked),
            then address, then links. */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)',
            gap: '2.5rem',
            alignItems: 'start',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
          }}
          className="footer-grid"
        >
          <div>
            <Image
              src="/logos/Primary logo_white.svg"
              alt="Citizens for Change"
              width={210}
              height={91}
              style={{ width: 'clamp(160px, 17vw, 210px)', height: 'auto', marginBottom: 16 }}
              unoptimized
            />
            <p style={{ fontSize: 13, fontWeight: 400, color: '#fff', marginBottom: 14 }}>
              Powered by @connectgo
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

          <address style={{ fontSize: 13, lineHeight: 1.75, color: '#fff', fontStyle: 'normal' }}>
            <em>ConnectGo trades under the brand Citizens for Change.</em><br />
            8B Neville Terrace, Tunbridge Wells, Kent, United Kingdom, TN2 5QY.<br />
            Reg. 11200005
          </address>

          {/* Right-aligned so the link labels terminate flush with the
              container's right edge — the same edge the header nav and the
              CTA content above align to. */}
          <nav aria-label="Quick links" style={{ textAlign: 'right' }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {quickLinks.map(({ href, label, external }) => (
                <li key={href} style={{ marginBottom: 14 }}>
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={footerLinkStyle}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      style={footerLinkStyle}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
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
                  style={footerLinkStyle}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Cookie Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom row — copyright */}
        <div style={{ paddingTop: '1.5rem' }}>
          <p style={{ fontSize: 13, fontWeight: 400, color: '#fff' }}>
            Copyright &copy; 2026 ConnectGo. All Rights Reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
