// components/support/BreadcrumbNav.tsx
import { FC } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbNavProps {
  section: string;
  title: string;
}

const BreadcrumbNav: FC<BreadcrumbNavProps> = ({ section, title }) => {
  // Map section IDs to user-friendly names
  const sectionNames: Record<string, string> = {
    'project-setup': 'Set up your project',
    'stakeholder-mapping': 'Stakeholder Mapping',
    'theory-of-change': 'Theory of Change',
    'building-survey': 'Building a Survey',
    'add-users': 'Add Users',
    'fix-issue': 'Fix an Issue'
  };

  const sectionName = sectionNames[section] || section;

  return (
    <nav className="flex mb-6 text-sm text-gray-500">
      <ol className="flex items-center flex-wrap">
        <li className="flex items-center">
          <Link href="/" className="hover:text-stratosphere-900">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
        </li>
        <li className="flex items-center">
          <Link href="/support" className="hover:text-stratosphere-900">
            Help Center
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
        </li>
        <li className="flex items-center">
          <Link href={`/support#${section}`} className="hover:text-stratosphere-900">
            {sectionName}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
        </li>
        <li className="text-stratosphere font-medium truncate max-w-xs">
          {title}
        </li>
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;