import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/shared/ui';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['700'],
});

export const metadata: Metadata = {
  title: '강경규 | Gng - AI Chat Workbench',
  description: '강경규의 AI Chat Workbench - prompt & model experiments를 위한 도구',
  keywords: ['강경규', 'AI', 'Chat', 'Workbench', 'LLM', 'GPT', 'Claude'],
  authors: [{ name: '강경규' }],
  creator: '강경규',
  publisher: '강경규',
  manifest: '/manifest.json',
  metadataBase: new URL('https://my-blog-ivory-nine.vercel.app'),
  openGraph: {
    title: '강경규 | Gng - AI Chat Workbench',
    description: '강경규의 AI Chat Workbench - prompt & model experiments를 위한 도구',
    url: 'https://my-blog-ivory-nine.vercel.app',
    siteName: 'Gng',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '강경규 | Gng - AI Chat Workbench',
    description: '강경규의 AI Chat Workbench - prompt & model experiments를 위한 도구',
    creator: '@ganggyunggyu',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gng',
    startupImage: '/apple-touch-icon.png',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'vyfIxuGZihJ6gbFgb6TWs_9zU6rgRGSxF705s5B4utw',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
