'use client';
import React, { createContext, useState, useContext } from 'react';
const ThemeContext = createContext<any | undefined>(undefined);
export const ThemeProvider: React.FC<any> = ({ children }) => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): any => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
