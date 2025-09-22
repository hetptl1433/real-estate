'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import './globals.css';

import { Geist, Geist_Mono } from 'next/font/google';
import AuthProvider from '../components/AuthProvider';

// If you’re using MUI theme (optional but recommended)
// import { ThemeProvider, CssBaseline } from '@mui/material';
// import { theme } from '@/theme';

export const metadata = {
  title: 'Real estate investment analysis',
  description: 'Better real estate investment decisions with AI-powered analysis.',
};

// Apply fonts
const geist = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo_house_check.svg" type="image/svg+xml" />
      </head>
      <body className={`${geist.className} ${geistMono.variable ?? ''}`}>
        <AuthProvider>
          {/* <ThemeProvider theme={theme}>
            <CssBaseline /> */}
            {children}
          {/* </ThemeProvider> */}
        </AuthProvider>
      </body>
    </html>
  );
}