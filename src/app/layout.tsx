import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
  userScalable: false,
  themeColor: '#62D926', // Lime green theme color
};

export const metadata: Metadata = {
  title: 'Warrity',
  description: 'Manage your warranties with ease with Warrity.',
  applicationName: 'Warrity',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Warrity',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json', // Placeholder for PWA manifest
  // Use inline SVG icon to avoid manifest icon errors
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90" x="50%" text-anchor="middle" dominant-baseline="middle" fill="%2362D926">W</text></svg>',
    apple: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90" x="50%" text-anchor="middle" dominant-baseline="middle" fill="%2362D926">W</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
