'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e2ddd5',
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '0 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-rajdhani), sans-serif',
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: '0.03em',
            color: '#1a1814',
            textDecoration: 'none',
          }}
        >
          Citizens for{' '}
          <span className="c4c-grad-text">Change</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex" style={{ gap: '2.25rem', alignItems: 'center' }}>
          {[
            { href: '/#realities', label: 'What We Hear' },
            { href: '/#who', label: 'Who We Are' },
            { href: '/#offers', label: 'How We Help' },
            { href: '/#partners', label: 'Why C4C' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'rgba(26,24,20,0.60)',
                textDecoration: 'none',
                transition: 'color 0.15s',
                fontFamily: 'var(--font-nunito), sans-serif',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#1a1814')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(26,24,20,0.60)')}
            >
              {label}
            </Link>
          ))}

          {isAuthenticated ? (
            <Link
              href={dashboardPath}
              style={{
                background: '#1a1814',
                color: '#fff',
                padding: '9px 22px',
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
                fontFamily: 'var(--font-rajdhani), sans-serif',
                letterSpacing: '0.04em',
                transition: 'background 0.15s',
              }}
            >
              Dashboard
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                href="/account/login"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(26,24,20,0.60)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-nunito), sans-serif',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1a1814')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(26,24,20,0.60)')}
              >
                Log in
              </Link>
              <Link
                href="/account/signup"
                style={{
                  background: '#1a1814',
                  color: '#fff',
                  padding: '9px 22px',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-rajdhani), sans-serif',
                  letterSpacing: '0.04em',
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
                  color: 'rgba(26,24,20,0.60)',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#e2ddd5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={16} color="#1a1814" />
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
                    border: '1px solid #e2ddd5',
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
                      borderTop: '1px solid #e2ddd5',
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
          {isMenuOpen ? <X size={22} color="#1a1814" /> : <Menu size={22} color="#1a1814" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          style={{
            borderTop: '1px solid #e2ddd5',
            padding: '1rem 2.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {[
            { href: '/#realities', label: 'What We Hear' },
            { href: '/#who', label: 'Who We Are' },
            { href: '/#offers', label: 'How We Help' },
            { href: '/#partners', label: 'Why C4C' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              style={{
                padding: '10px 0',
                fontSize: 15,
                fontWeight: 500,
                color: 'rgba(26,24,20,0.70)',
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
                    color: 'rgba(26,24,20,0.70)',
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
                    color: 'rgba(26,24,20,0.70)',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2ddd5' }}>
                <Link
                  href="/account/login"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    padding: '10px 0',
                    fontSize: 15,
                    fontWeight: 500,
                    color: 'rgba(26,24,20,0.70)',
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
                    fontWeight: 600,
                    fontFamily: 'var(--font-rajdhani), sans-serif',
                    letterSpacing: '0.04em',
                    background: '#1a1814',
                    color: '#fff',
                    borderRadius: 4,
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
