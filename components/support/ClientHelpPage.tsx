// components/support/ClientHelpPage.tsx
'use client';

import { HelpTopicMetadata } from '@/types';
import HelpPageTemplate from './HelpPageTemplate';
import HelpContent from './HelpContent';
import { MDXRemoteSerializeResult } from 'next-mdx-remote'; // Import the type

interface ClientHelpPageProps {
  metadata: HelpTopicMetadata;
  mdxSource: MDXRemoteSerializeResult; // Update the type here
}

export default function ClientHelpPage({ metadata, mdxSource }: ClientHelpPageProps) {
  return (
    <HelpPageTemplate
      metadata={metadata}
      content={<HelpContent source={mdxSource} />}
    />
  );
}