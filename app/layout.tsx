// app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/contexts/QueryProvider'; // ADD THIS
import type { Metadata } from 'next';
import { Rajdhani, Nunito } from 'next/font/google'
// @ts-ignore: allow importing global css without type declarations
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-rajdhani',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Citizens for Change — Learning Infrastructure for Purpose-Led Organisations',
  description: 'Citizens for Change provides the tech, skills and connections that enable purpose-led organisations to demonstrate the impact of doing the right thing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${nunito.variable}`}>
      <body className={nunito.className}>
        <QueryProvider>  {/* ADD THIS - Wraps everything that needs data fetching */}
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}