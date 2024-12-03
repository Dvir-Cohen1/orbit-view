'use client';
// import React, { createContext, useState, useContext, ReactNode } from 'react';

// type Theme = 'light' | 'dark';

// type ThemeContextType = {
//     theme: Theme;
//     toggleTheme: () => void;
// };

// const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// type ThemeProviderProps = {
//     children: ReactNode;
// };

// export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
//     const [theme, setTheme] = useState<Theme>('light');

//     const toggleTheme = () => {
//         setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
//     };

//     return (
//         <ThemeContext.Provider value={{ theme, toggleTheme }}>
//             {children}
//         </ThemeContext.Provider>
//     );
// };

// export const useTheme = (): ThemeContextType => {
//     const context = useContext(ThemeContext);
//     if (!context) {
//         throw new Error('useTheme must be used within a ThemeProvider');
//     }
//     return context;
// };

import React, { createContext, useState, useContext, ReactNode } from 'react';

const ThemeContext = createContext<any | undefined>(undefined);

export const ThemeProvider: React.FC<any> = ({ children }) => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    //     const updateSelectedLink = (link: string) => {
    //         setSelectedLink(link);
    //     };

    return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): any => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
