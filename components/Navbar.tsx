'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/#what-we-hear', label: 'What We Hear' },
  { href: '/#how-we-respond', label: 'How We Respond' },
  { href: '/#what-c4c-is', label: 'What We Do' },
  { href: '/#who-we-are', label: 'Who We Are' },
  { href: '/#why-c4c', label: 'Why C4C' },
];

const navLinkStyle: CSSProperties = {
  fontFamily: 'var(--font-space-grotesk), sans-serif',
  fontWeight: 700,
  fontSize: 12.5,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  color: '#fff',
  whiteSpace: 'nowrap',
  display: 'inline-block',
  paddingBlock: 6,
  lineHeight: 1,
  boxShadow: 'inset 0 -2px 0 0 transparent',
  transition: 'box-shadow 0.15s',
};

const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dashboardPath = user?.isConnectGoStaff ? '/admin/dashboard' : '/dashboard';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#00415a',
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '18px clamp(20px, 5vw, 48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '18px 24px',
          flexWrap: 'wrap',
          minHeight: 108,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
          <Image
            src="/logos/Primary logo_white.png"
            alt="Citizens for Change"
            width={190}
            height={82}
            style={{ width: 'clamp(150px, 15vw, 190px)', height: 'auto' }}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex"
          style={{ gap: 'clamp(10px, 1.5vw, 22px)', alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end', flexWrap: 'wrap' }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={navLinkStyle}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'inset 0 -2px 0 0 #ff6b58')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'inset 0 -2px 0 0 transparent')}
            >
              {label}
            </Link>
          ))}

          {isAuthenticated ? (
            <Link
              href={dashboardPath}
              style={{
                display: 'inline-block',
                background: '#fff',
                color: '#00415a',
                padding: '10px 22px',
                lineHeight: 1,
                fontWeight: 700,
                fontSize: 12.5,
                textDecoration: 'none',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                transition: 'opacity 0.15s',
              }}
            >
              Dashboard
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                href="/account/login"
                style={{
                  display: 'inline-block',
                  lineHeight: 1,
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  fontWeight: 700,
                  fontSize: 12.5,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.80)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.80)')}
              >
                Log in
              </Link>
              <Link
                href="/account/signup"
                style={{
                  display: 'inline-block',
                  background: '#fff',
                  color: '#00415a',
                  padding: '10px 22px',
                  lineHeight: 1,
                  fontWeight: 700,
                  fontSize: 12.5,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-space-grotesk), sans-serif',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Authenticated profile dropdown */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.80)',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={16} color="#fff" />
                </div>
                <span>{user?.name}</span>
              </button>
              {isProfileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: 8,
                    width: 192,
                    background: '#fff',
                    border: '1px solid #d6d7da',
                    borderRadius: 6,
                    boxShadow: '0 4px 16px rgba(26,24,20,0.10)',
                    zIndex: 50,
                  }}
                >
                  {[
                    { href: '/profile', label: 'Your Profile' },
                    { href: '/settings', label: 'Settings' },
                  ].map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsProfileOpen(false)}
                      style={{
                        display: 'block',
                        padding: '10px 16px',
                        fontSize: 13,
                        color: '#1a1814',
                        textDecoration: 'none',
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '10px 16px',
                      fontSize: 13,
                      color: '#1a1814',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderTop: '1px solid #d6d7da',
                    }}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.15)',
            padding: '1rem clamp(20px, 5vw, 48px) 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              style={{
                padding: '10px 0',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.90)',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}

          <div style={{ marginTop: '0.75rem' }}>
            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardPath}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 0',
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.80)',
                    textDecoration: 'none',
                  }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 0',
                    fontSize: 15,
                    color: 'rgba(255,255,255,0.80)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <Link
                  href="/account/login"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    padding: '10px 0',
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.80)',
                    textDecoration: 'none',
                  }}
                >
                  Log in
                </Link>
                <Link
                  href="/account/signup"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'var(--font-space-grotesk), sans-serif',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    background: '#fff',
                    color: '#00415a',
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
