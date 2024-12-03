import type { Metadata } from 'next';
import { poppins, nunito_sans } from '@/utils/fonts';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
    title: 'OrbitView - Explore the cosmos, one orbit at a time',
    description: "A 3D solar system simulation built with React and Three.js, bringing the wonders of space to your screen.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang='en' className={`relative ${nunito_sans} ${poppins}`}>
            <ThemeProvider>{children}</ThemeProvider>
        </html>
    );
}
