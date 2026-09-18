// components/support/NavigationTabs.tsx
import { FC } from 'react';
import Link from 'next/link';

interface NavigationTabsProps {
  activeTab: string;
}

const NavigationTabs: FC<NavigationTabsProps> = ({ activeTab }) => {
  return (
    <div className="bg-white border-b border-neutral">
      <div className="container mx-auto">
        <nav className="flex">
          <Link 
            href="/support" 
            className={`px-6 py-4 ${activeTab === 'help' 
              ? 'text-neutral-500 border-b-2 border-neutral-500 font-medium'
              : 'text-ink/70 hover:text-ink'}`}
          >
            Help Center
          </Link>
          <Link 
            href="/support/sampling" 
            className={`px-6 py-4 ${activeTab === 'sampling' 
              ? 'text-neutral-500 border-b-2 border-neutral-500 font-medium'
              : 'text-ink/70 hover:text-ink'}`}
          >
            Sampling Framework
          </Link>
          <Link 
            href="/support/announcements" 
            className={`px-6 py-4 ${activeTab === 'announcements' 
              ? 'text-neutral-500 border-b-2 border-neutral-500 font-medium'
              : 'text-ink/70 hover:text-ink'}`}
          >
            Announcements
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default NavigationTabs;