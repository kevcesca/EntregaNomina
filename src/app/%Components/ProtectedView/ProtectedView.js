'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Importa el contexto de autenticación
import { useRouter } from 'next/navigation';
import { API_USERS_URL } from '../../%Config/apiConfig';

const ProtectedView = ({ requiredPermissions = [], children }) => {
    const [hasAccess, setHasAccess] = useState(false);
    const { logout } = useAuth(); // Usa la función logout del contexto
    const router = useRouter();

    useEffect(() => {
        const verifyAccess = async () => {
            try {
                // Llama al endpoint para verificar permisos
                const response = await fetch(`${API_USERS_URL}/verify-permissions`, {
                    credentials: 'include', // Incluye cookies HttpOnly
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Respuesta del servidor:', data);

                // Verifica si el usuario tiene al menos uno de los permisos requeridos
                const hasRequiredPermission = requiredPermissions.some(permission =>
                    data.permisos.includes(permission)
                );

                if (!hasRequiredPermission) {
                    console.error(`El usuario no tiene los permisos requeridos: ${requiredPermissions}`);
                    router.push('/unauthorized');
                    return;
                }

                // Si todo está bien, permite el acceso
                setHasAccess(true);
            } catch (error) {
                console.error('Error al verificar permisos:', error);

                // Cierra la sesión en lugar de redirigir al inicio
                await logout();
            }
        };

        verifyAccess();
    }, [requiredPermissions, router, logout]);

    if (!hasAccess) return null; // Muestra nada mientras se verifica el acceso

    return <>{children}</>;
};

export default ProtectedView;
