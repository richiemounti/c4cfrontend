// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/contexts/QueryProvider'; // ADD THIS
import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google'
// @ts-ignore: allow importing global css without type declarations
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['600'],
})

// Brand spec only needs 400, 400 italic, 600 and 700 — next/font's
// weight × style API can't express "italic for 400 only" in one call, so
// this fetches a couple of unused italic weights (600/700) beyond the
// reference file's exact @font-face list. Nothing on the page ever
// requests those styles, so it has no visible effect.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Citizens for Change — Learning Infrastructure for Purpose-Led Organisations',
  description: 'Citizens for Change provides the tech, skills and connections that enable purpose-led organisations to demonstrate the impact of doing the right thing.',
  icons: {
    icon: '/icons/Brand Icon_black.png',
    shortcut: '/icons/Brand Icon_black.png',
    apple: '/icons/Brand Icon_black.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
      <body className={ibmPlexSans.className}>
        <QueryProvider>  {/* ADD THIS - Wraps everything that needs data fetching */}
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}