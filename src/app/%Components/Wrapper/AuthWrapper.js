// src/app/%Components/Wrapper/AuthWrapper.js
'use client';
import React from 'react';
import { useAuth } from '../../context/AuthContext';  // Importa el contexto de autenticación
import Wrapper from './Wrapper';
import Login from '../Login/Login';
import Registrarse from '../Registrarse/Registrarse';
import RecuperarContra from '../RecuperarContra/RecuperarContra';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../$tema/theme';

const AuthWrapper = ({ children }) => {
    const { isAuthenticated, user } = useAuth(); // Obtiene el estado de autenticación y el usuario
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    const publicRoutes = ['/RecuperarContra', '/Registrarse', '/Login'];

    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
        // Si el usuario no está autenticado y no está en una ruta pública, muestra la página de login
        return (
            <ThemeProvider theme={theme}>
                <Login />
            </ThemeProvider>
        );
    }

    // Si está en una ruta pública, muestra la página correspondiente
    if (!isAuthenticated) {
        switch (pathname) {
            case '/Registrarse':
                return (
                    <ThemeProvider theme={theme}>
                        <Registrarse />
                    </ThemeProvider>
                );
            case '/RecuperarContra':
                return (
                    <ThemeProvider theme={theme}>
                        <RecuperarContra />
                    </ThemeProvider>
                );
            case '/Login':
                return (
                    <ThemeProvider theme={theme}>
                        <Login />
                    </ThemeProvider>
                );
            default:
                return (
                    <ThemeProvider theme={theme}>
                        <Login />
                    </ThemeProvider>
                );
        }
    }

    // Si el usuario está autenticado, muestra el contenido dentro del Wrapper
    return (
        <ThemeProvider theme={theme}>
            <Wrapper user={user}>
                {children}
            </Wrapper>
        </ThemeProvider>
    );
};

export default AuthWrapper;
