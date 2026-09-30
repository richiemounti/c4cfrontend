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

// Brand spec needs 400, 400 italic, 600 and 700 for the homepage, plus 500
// for the app platform (App Mockup 23 09 26 — used once, the meta "value"
// text on Project Home; everything else in the app is 400 or 600). next/
// font's weight × style API can't express "italic for 400 only" in one
// call, so this also fetches a couple of unused italic weights (500/600/
// 700) beyond either reference file's exact @font-face list — nothing on
// the page ever requests those styles, so it has no visible effect.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Citizens for Change — Learning Infrastructure for Good Organisations.',
  description: 'Citizens for Change provides the tech, skills and connections that enable purpose-led organisations to demonstrate the impact of doing the right thing — individually and collectively.',
  icons: {
    icon: '/icons/Brand icon_bright coral on pink.png',
    shortcut: '/icons/Brand icon_bright coral on pink.png',
    apple: '/icons/Brand icon_bright coral on pink.png',
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