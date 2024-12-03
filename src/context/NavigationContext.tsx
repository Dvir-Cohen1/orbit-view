import React, { createContext, useState, useContext, ReactNode } from 'react';

type NavigationContextType = {
    selectedLink: string | null;
    updateSelectedLink: (link: string) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

type NavigationProviderProps = {
    children: ReactNode;
};

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
    const [selectedLink, setSelectedLink] = useState<string | null>('About');

    const updateSelectedLink = (link: string) => {
        setSelectedLink(link);
    };

    return (
        <NavigationContext.Provider value={{ selectedLink, updateSelectedLink }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = (): NavigationContextType => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
