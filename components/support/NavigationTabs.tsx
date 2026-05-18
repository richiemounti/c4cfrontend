// components/support/NavigationTabs.tsx
import { FC } from 'react';
import Link from 'next/link';

interface NavigationTabsProps {
  activeTab: string;
}

const NavigationTabs: FC<NavigationTabsProps> = ({ activeTab }) => {
  return (
    <div className="bg-white border-b border-sky">
      <div className="container mx-auto">
        <nav className="flex">
          <Link 
            href="/support" 
            className={`px-6 py-4 ${activeTab === 'help' 
              ? 'text-sky-500 border-b-2 border-sky-500 font-medium'
              : 'text-stratosphere/70 hover:text-stratosphere'}`}
          >
            Help Center
          </Link>
          <Link 
            href="/support/sampling" 
            className={`px-6 py-4 ${activeTab === 'sampling' 
              ? 'text-sky-500 border-b-2 border-sky-500 font-medium'
              : 'text-stratosphere/70 hover:text-stratosphere'}`}
          >
            Sampling Framework
          </Link>
          <Link 
            href="/support/announcements" 
            className={`px-6 py-4 ${activeTab === 'announcements' 
              ? 'text-sky-500 border-b-2 border-sky-500 font-medium'
              : 'text-stratosphere/70 hover:text-stratosphere'}`}
          >
            Announcements
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default NavigationTabs;