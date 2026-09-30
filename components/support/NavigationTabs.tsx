// components/support/NavigationTabs.tsx
import { FC } from 'react';
import Link from 'next/link';

interface NavigationTabsProps {
  activeTab: string;
}

const NavigationTabs: FC<NavigationTabsProps> = ({ activeTab }) => {
  return (
    <div className="bg-white border-b border-c4c-rule">
      <div className="container mx-auto">
        <nav className="flex">
          <Link
            href="/support"
            className={`px-6 py-4 ${activeTab === 'help'
              ? 'text-c4c-petrol border-b-2 border-c4c-petrol font-medium'
              : 'text-black/70 hover:text-black'}`}
          >
            Help Center
          </Link>
          <Link
            href="/support/sampling"
            className={`px-6 py-4 ${activeTab === 'sampling'
              ? 'text-c4c-petrol border-b-2 border-c4c-petrol font-medium'
              : 'text-black/70 hover:text-black'}`}
          >
            Sampling Framework
          </Link>
          <Link
            href="/support/announcements"
            className={`px-6 py-4 ${activeTab === 'announcements'
              ? 'text-c4c-petrol border-b-2 border-c4c-petrol font-medium'
              : 'text-black/70 hover:text-black'}`}
          >
            Announcements
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default NavigationTabs;