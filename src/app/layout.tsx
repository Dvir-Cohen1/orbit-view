import type { Metadata } from 'next';
import { poppins, nunito_sans } from '@/lib/fonts';
import '@/styles/globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { APP_METADATA } from '@/constants/app.constants';
import { SpeedInsights } from "@vercel/speed-insights/next"
export const metadata: Metadata = APP_METADATA;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' className={`relative ${nunito_sans} ${poppins}`}>
            <ThemeProvider>{children}</ThemeProvider>
            <SpeedInsights/>
        </html>
    );
}
