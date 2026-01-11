// src/app/layout.tsx
import type { Metadata } from 'next';
import { poppins, nunito_sans } from '@/lib/fonts';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { APP_METADATA } from '@/constants/app.constants';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ThemeBodyClass from './ThemeBodyClass';

export const metadata: Metadata = APP_METADATA;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`relative ${nunito_sans} ${poppins}`} suppressHydrationWarning>
            <body className="flex min-h-screen flex-col text-primary-text" suppressHydrationWarning>
                <ThemeProvider>
                    <ThemeBodyClass />
                    {children}
                    <SpeedInsights />
                </ThemeProvider>
            </body>
        </html>
    );
}
