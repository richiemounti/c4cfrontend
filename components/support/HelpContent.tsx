// components/support/HelpContent.tsx
import { FC } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import Image from 'next/image';
import Link from 'next/link';

// Define custom components for MDX content
const components = {
  // Override the default anchor tag with Next.js Link
  a: ({ href, children, ...props }: any) => {
    if (href && href.startsWith('/')) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  
  // Override image with Next.js Image
  img: ({ src, alt, width, height, ...props }: any) => {
    if (!src) return null;
    
    return (
      <div className="my-6">
        <Image
          src={src}
          alt={alt || ''}
          width={width || 800}
          height={height || 450}
          className="rounded-lg"
          {...props}
        />
        {alt && (
          <p className="text-sm text-stratosphere-500 text-center mt-2">{alt}</p>
        )}
      </div>
    );
  },
  
  // Custom callout component
  Callout: ({ type = 'info', title, children }: any) => {
    const styles = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      tip: 'bg-green-50 border-green-200 text-green-800',
    };
    
    const style = styles[type as keyof typeof styles] || styles.info;
    
    return (
      <div className={`${style} border-l-4 p-4 my-4 rounded-r-lg`}>
        {title && <p className="font-medium mb-1 text-stratosphere">{title}</p>}
        <div className='text-stratosphere-500'>{children}</div>
      </div>
    );
  },
  
  // Custom step component for step-by-step guides
  Step: ({ number, title, children }: any) => {
    return (
      <div className="mb-6">
        <div className="flex items-start">
          <div className="bg-sky/20 text-sky-500 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 mt-1 flex-shrink-0">
            {number}
          </div>
          <div>
            {title && <h3 className="text-lg font-medium mb-2 text-stratosphere">{title}</h3>}
            <div className='text-stratosphere'>{children}</div>
          </div>
        </div>
      </div>
    );
  },
  
  // Code block with syntax highlighting
  pre: (props: any) => (
    <pre className="bg-sky-900 text-sky p-4 rounded-lg overflow-x-auto my-4">
      {props.children}
    </pre>
  ),
  
  // Table styles
  table: (props: any) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full divide-y divide-sky border border-sky rounded-lg">
        {props.children}
      </table>
    </div>
  ),
  thead: (props: any) => (
    <thead className="bg-sky-50">
      {props.children}
    </thead>
  ),
  th: (props: any) => (
    <th 
      scope="col" 
      className="px-6 py-3 text-left text-xs font-medium text-stratosphere uppercase tracking-wider"
    >
      {props.children}
    </th>
  ),
  td: (props: any) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-stratosphere border-t border-sky">
      {props.children}
    </td>
  ),
};

interface HelpContentProps {
  source: any; // MDX source from next-mdx-remote/serialize
}

const HelpContent: FC<HelpContentProps> = ({ source }) => {
  return (
    <div className="help-content text-stratosphere">
      <MDXRemote {...source} components={components} />
    </div>
  );
};

export default HelpContent;