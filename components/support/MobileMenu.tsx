// components/support/MobileMenu.tsx
import { FC } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenu: FC<MobileMenuProps> = ({ isOpen, toggleMenu }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 md:hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-medium text-stratosphere">Menu</h2>
        <button onClick={toggleMenu} className="p-2">
          <svg className="h-6 w-6 text-stratosphere" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="p-4">
        <Link href="/support" className="block py-2 text-sky-500 font-medium">
          Help Center
        </Link>
        <Link href="/support/sampling" className="block py-2 text-stratosphere/70">
          Sampling Framework
        </Link>
        <Link href="/support/announcements" className="block py-2 text-stratosphere/70">
          Announcements
        </Link>
        <div className="border-t my-4"></div>
        <Link href="/" className="flex items-center py-2 text-stratosphere/70">
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </nav>
    </div>
  );
};

export default MobileMenu;