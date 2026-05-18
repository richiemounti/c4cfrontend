// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Determine dashboard path based on user role
  const dashboardPath = user?.isConnectGoStaff ? "/admin/dashboard" : "/dashboard";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Router will handle redirect in the logout function
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-stratosphere py-4 px-6 border-b border-stratosphere">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* Level Logo */}
          <Link href="/" className="mr-10">
            <Image 
              src="/reflecticon.PNG" 
              alt="LEVEL" 
              width={120} 
              height={30}
              className="h-8 w-auto"
            />
          </Link>
          
          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex space-x-10">
            <Link href="/news" className="text-white hover:text-sky-tint">
              News
            </Link>
            <Link href="/purchase" className="text-white hover:text-sky-tint">
              Purchase
            </Link>
            <Link href="/support" className="text-white hover:text-sky-tint">
              Support
            </Link>
            
            {isAuthenticated ? (
              <Link href={dashboardPath} className="text-white hover:text-sky-tint">
                Dashboard
              </Link>
            ) : (
              <Link href="/account/login" className="text-white hover:text-sky-tint">
                Account
              </Link>
            )}
          </nav>
        </div>
        
        {/* Right Side - Search and Auth */}
        <div className="flex items-center space-x-4">
          {/* Search Icon */}
          <button className="p-2 rounded-full hover:bg-white/10">
            <Search className="h-5 w-5 text-white/80" />
          </button>
          
          {/* User Profile - Desktop */}
          {isAuthenticated && (
            <div className="hidden md:block relative">
              <button 
                onClick={toggleProfile}
                className="flex items-center space-x-2 text-white hover:text-sky-tint"
                aria-expanded={isProfileOpen}
              >
                <div className="h-8 w-8 rounded-full bg-sky-tint flex items-center justify-center">
                  <User className="h-5 w-5 text-stratosphere" />
                </div>
                <span>{user?.name}</span>
              </button>
              
              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-sky z-50">
                  <div className="py-1">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-stratosphere hover:bg-sky/10"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-2 text-sm text-stratosphere hover:bg-sky/10"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-stratosphere hover:bg-sky/10"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-full hover:bg-white/10"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-white/80" />
            ) : (
              <Menu className="h-6 w-6 text-white/80" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/20">
          <nav className="flex flex-col space-y-4 pb-4">
            <Link 
              href="/news" 
              className="text-white hover:text-sky-tint px-6 py-2"
              onClick={toggleMenu}
            >
              News
            </Link>
            <Link 
              href="/purchase" 
              className="text-white hover:text-sky-tint px-6 py-2"
              onClick={toggleMenu}
            >
              Purchase
            </Link>
            <Link 
              href="/support" 
              className="text-white hover:text-sky-tint px-6 py-2"
              onClick={toggleMenu}
            >
              Support
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  href={dashboardPath}
                  className="text-white hover:text-sky-tint px-6 py-2"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className="text-white hover:text-sky-tint px-6 py-2"
                  onClick={toggleMenu}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex items-center text-white hover:text-sky-tint px-6 py-2"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/account/login" 
                className="text-white hover:text-sky-tint px-6 py-2"
                onClick={toggleMenu}
              >
                Login / Sign Up
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;