'use client'
import type { Metadata } from 'next';
import { poppins, nunito_sans } from '@/utils/fonts';
import '@/styles/globals.css';
import { useTheme } from '@/context/ThemeContext';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header';

import { NavigationProvider } from '@/context/NavigationContext';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { theme } = useTheme();
    return (
        <body className={`${theme} flex min-h-screen flex-col justify-between text-primary-text`}>
            <NavigationProvider>
                <Header />
                <main>{children}</main>
                {/* <Footer /> */}
            </NavigationProvider>
        </body >
    );
}
