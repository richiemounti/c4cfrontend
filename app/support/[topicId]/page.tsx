// app/support/[topicId]/page.tsx
import { notFound } from 'next/navigation';
import ClientHelpPage from '@/components/support/ClientHelpPage';
import { helpTopicsRegistry } from '@/data/helpTopicsRegistry';
import { getMdxContent } from '@/lib/mdx';

interface HelpPageProps {
  params: {
    topicId: string;
  };
}

export async function generateMetadata({ params }: HelpPageProps) {
  const { topicId } = params;
  const topic = helpTopicsRegistry[topicId];
  
  if (!topic) {
    return {
      title: 'Topic Not Found | C4C Help Center',
      description: 'The requested help topic could not be found.',
    };
  }
  
  return {
    title: `${topic.title} | C4C Help Center`,
    description: topic.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(helpTopicsRegistry).map(topicId => ({
    topicId,
  }));
}

export default async function HelpPage({ params }: HelpPageProps) {
  const { topicId } = params;
  const topic = helpTopicsRegistry[topicId];
  
  if (!topic) {
    notFound();
  }
  
  // Load MDX content
  const mdxSource = await getMdxContent(`/content/${topicId}.mdx`);
  
  return <div className='bg-sky-tint'><ClientHelpPage metadata={topic} mdxSource={mdxSource} /></div>;
}