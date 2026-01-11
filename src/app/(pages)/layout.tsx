// src/app/(pages)/layout.tsx
'use client';

import React from 'react';
import { NavigationProvider } from '@/context/NavigationContext';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
    return (
        <NavigationProvider>
            <main className="flex-1">{children}</main>
        </NavigationProvider>
    );
}
