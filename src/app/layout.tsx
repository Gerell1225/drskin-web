import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { AppThemeProvider } from './providers';

export const metadata: Metadata = {
  title: 'Dr.Skin & Dr.Hair Salon',
  description: 'Premium beauty & facial salon in Ulaanbaatar, Mongolia.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
