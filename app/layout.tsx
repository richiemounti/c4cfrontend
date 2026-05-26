// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/contexts/QueryProvider'; // ADD THIS
import type { Metadata } from 'next';
import { Sora } from 'next/font/google'
// @ts-ignore: allow importing global css without type declarations
import "./globals.css";

import { BugReportProvider } from '@/components/feedback';
import { StreamChatProvider } from '@/contexts/StreamChatContext';


const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'C4C Platform',
  description: 'A platform for social Monitoring, Reporting, and Verification in the carbon sector',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sora.variable}>
      <body className={sora.className}>
        <BugReportProvider>
          <QueryProvider>  {/* ADD THIS - Wraps everything that needs data fetching */}
            <AuthProvider>
              <StreamChatProvider 
                apiKey={process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY || ''}
              >
                {children}
              </StreamChatProvider>
            </AuthProvider>
          </QueryProvider>
        </BugReportProvider>
      </body>
    </html>
  );
}