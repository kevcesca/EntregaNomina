'use client';
// src/app/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_USERS_URL } from '../%Config/apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Control de carga inicial
    const router = useRouter();

    useEffect(() => {
        // Recuperar el usuario desde localStorage al recargar la página
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
            setIsLoading(false); // Deja de mostrar el loader
        } else {
            // Si no está en localStorage, verificar el token
            const checkAuth = async (retryCount = 3, delay = 500) => {
                let attempts = 0;
        
                const attemptVerification = async () => {
                    try {
                        console.log(`Intentando verificar token... Intento ${attempts + 1}`);
                        const response = await fetch(`${API_USERS_URL}/verify-token`, {
                            method: 'GET',
                            credentials: 'include', // Asegura que las cookies se envíen
                        });
        
                        if (response.ok) {
                            const data = await response.json();
                            console.log('Usuario autenticado:', data.user);
                            setUser(data.user); // Guarda los datos del usuario
                            setIsAuthenticated(true);
                            setIsLoading(false); // Finaliza la carga si es exitoso
                            localStorage.setItem('user', JSON.stringify(data.user)); // Guarda el usuario en localStorage
                            return;
                        } else {
                            console.warn('Token inválido o no autenticado');
                            attempts++;
                            if (attempts < retryCount) {
                                console.log(`Reintentando en ${delay} ms...`);
                                setTimeout(attemptVerification, delay);
                            } else {
                                setUser(null);
                                setIsAuthenticated(false);
                                setIsLoading(false); // Finaliza la carga después de los reintentos
                            }
                        }
                    } catch (error) {
                        console.error('Error al verificar el token:', error);
                        attempts++;
                        if (attempts < retryCount) {
                            console.log(`Reintentando en ${delay} ms...`);
                            setTimeout(attemptVerification, delay);
                        } else {
                            setUser(null);
                            setIsAuthenticated(false);
                            setIsLoading(false); // Finaliza la carga después de los reintentos
                        }
                    }
                };
        
                attemptVerification();
            };
        
            checkAuth(); // Inicia el proceso de verificación con reintentos
        }
    }, []); // Solo se ejecuta una vez al cargar la página

    const login = (userData) => {
        setUser(userData); // Guarda el usuario en el contexto
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData)); // Guardar el usuario en localStorage
    };

    const logout = async () => {
        await fetch(`${API_USERS_URL}/logout`, {
            method: 'POST',
            credentials: 'include', // Enviar la cookie al backend
        });

        setUser(null); // Eliminar el usuario del estado
        setIsAuthenticated(false);
        localStorage.removeItem('user'); // Eliminar el usuario de localStorage
        router.push('/'); // Redirigir al home
    };

    // Nueva función para verificar la contraseña del empleado
    const checkPasswordForEmployee = async (idEmpleado) => {
        try {
            const response = await fetch(`${API_USERS_URL}/check-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_empleado: idEmpleado,
                    password: 'Azcapotzalco1!',  // Suponiendo que esta es la contraseña a verificar
                }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Contraseña verificada correctamente:', data.message);
                return true;
            } else {
                console.error('Error al verificar la contraseña:', data.message);
                return false;
            }
        } catch (error) {
            console.error('Error en la verificación de la contraseña:', error);
            return false;
        }
    };

    // Mostrar un indicador de carga mientras se verifica el estado de autenticación
    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, setUser: login, logout, checkPasswordForEmployee }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
