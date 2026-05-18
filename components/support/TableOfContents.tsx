// components/support/TableOfContents.tsx
import { FC, useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

const TableOfContents: FC = () => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // Find all headings (h2, h3) in the content
    const articleHeadings = Array.from(
      document.querySelectorAll('.prose h2, .prose h3')
    );

    // Build the TOC items
    const items = articleHeadings.map((heading) => {
      // Generate ID if not present
      if (!heading.id) {
        heading.id = heading.textContent?.trim().toLowerCase().replace(/\s+/g, '-') || '';
      }

      return {
        id: heading.id,
        text: heading.textContent || '',
        level: heading.tagName === 'H2' ? 2 : 3,
      };
    });

    setHeadings(items);

    // Set up intersection observer to highlight active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px',
        threshold: 0.1,
      }
    );

    articleHeadings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, []);

  // If no headings, don't render anything
  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-md font-medium mb-3 text-stratosphere">On this page</h3>
      <nav>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li 
              key={heading.id}
              className={`${heading.level === 3 ? 'ml-4' : ''}`}
            >
              <a
                href={`#${heading.id}`}
                className={`block py-1 hover:text-stratosphere-500 transition-colors ${
                  activeId === heading.id
                    ? 'text-stratosphere-500 font-medium'
                    : 'text-gray-600'
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;