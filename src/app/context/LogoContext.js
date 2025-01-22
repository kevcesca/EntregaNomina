'use client';
import React, { createContext, useContext, useState } from 'react';

const LogoContext = createContext();

export const LogoProvider = ({ children }) => {
    const [logoUrl, setLogoUrl] = useState('');

    return (
        <LogoContext.Provider value={{ logoUrl, setLogoUrl }}>
            {children}
        </LogoContext.Provider>
    );
};

export const useLogo = () => {
    const context = useContext(LogoContext);
    if (!context) {
        throw new Error('useLogo must be used within a LogoProvider');
    }
    return context;
};
