import type { Metadata, Viewport } from 'next';
import { Inter, Bebas_Neue, Space_Grotesk } from 'next/font/google';
import { QueryProvider } from '@/lib/QueryProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' });

export const metadata: Metadata = {
  title: 'Modo Caverna',
  description: 'Disciplina é silêncio. Treino é fogo.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Caverna',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${bebas.variable} ${grotesk.variable} dark`}>
      <body className="bg-obsidian text-bone antialiased min-h-dvh">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
