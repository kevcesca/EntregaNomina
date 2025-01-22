import { useState, useEffect } from 'react';
import { API_USERS_URL } from '../../%Config/apiConfig';

const useUsers = () => {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_USERS_URL}/users-with-roles`);
            if (!response.ok) throw new Error('Error al obtener usuarios');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error al cargar los usuarios:', error);
        }
    };

    const toggleUserStatus = async (userId) => {
        try {
            const response = await fetch(`${API_USERS_URL}/users/${userId}/toggle-status`, { method: 'PUT' });
            if (!response.ok) throw new Error('Error al alternar el estado del usuario');
            await fetchUsers(); // Refrescar la lista
        } catch (error) {
            console.error('Error al alternar el estado del usuario:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, setUsers, fetchUsers, toggleUserStatus }; // Exponemos setUsers
};

export default useUsers;
