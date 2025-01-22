// src/app/context/AlertContext.js

'use client';

import React, { createContext, useState, useEffect } from 'react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alertDate, setAlertDate] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedDate = localStorage.getItem('alertDate');
            return savedDate ? new Date(savedDate) : null;
        }
        return null;
    });

    useEffect(() => {
        if (alertDate) {
            localStorage.setItem('alertDate', alertDate.toISOString());
        }
    }, [alertDate]);

    return (
        <AlertContext.Provider value={{ alertDate, setAlertDate }}>
            {children}
        </AlertContext.Provider>
    );
};

export default AlertContext;
