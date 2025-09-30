import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from './providers'; // <- new client wrapper

export const metadata = {
  title: 'Real estate investment analysis',
  description: 'Better real estate investment decisions with AI-powered analysis.',
};

const geist = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo_house_check.svg" type="image/svg+xml" />
      </head>
      <body className={`${geist.className} ${geistMono.variable ?? ''}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}