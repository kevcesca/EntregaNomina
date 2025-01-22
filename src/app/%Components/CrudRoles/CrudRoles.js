'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './CrudRoles.module.css';
import { API_USERS_URL } from '../../%Config/apiConfig';
import Toolbar from './Toolbar';
import RolesTable from './RolesTable';
import AssignPermissionsModal from './PermissionsModal';
import { Toast } from 'primereact/toast';


const CrudRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [editValues, setEditValues] = useState({ name: '', description: '' });
    const [modalRole, setModalRole] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]); // IDs de roles seleccionados
    const toast = useRef(null);


    // Fetch roles desde el backend
    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_USERS_URL}/roles-permissions`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Error al obtener los roles y permisos');
            }

            const data = await response.json();
            const mappedRoles = data.map((role) => ({
                id: role.rol_id,
                name: role.nombre_rol,
                description: role.descripcion_rol,
                permissions: role.permisos || [],
            }));
            setRoles(mappedRoles);
        } catch (error) {
            console.error(error);

            toast.current.show({ severity: 'error', summary: 'Error', detail: `No se pudieron cargar los roles. Por favor, inténtalo nuevamente.`, life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    // Llamar al fetch al cargar el componente
    useEffect(() => {
        fetchRoles();
    }, []);

    // Función para manejar la creación de un nuevo rol
    const handleRoleCreated = async (newRole) => {
        try {
            const response = await fetch(`${API_USERS_URL}/roles-permissions`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Error al obtener los roles después de crear uno nuevo');
            }

            const updatedRoles = await response.json();
            const mappedRoles = updatedRoles.map((role) => ({
                id: role.rol_id,
                name: role.nombre_rol,
                description: role.descripcion_rol,
                permissions: role.permisos || [],
            }));

            setRoles(mappedRoles); // Actualiza la lista completa de roles en el estado
            toast.current.show({ severity: 'success', summary: 'Success', detail: `Rol creado con exito `, life: 3000 }); // Alerta para confirmar la creación
        } catch (error) {
            console.error('Error al actualizar la tabla después de crear un rol:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: `No se pudieron cargar los roles. Por favor, inténtalo nuevamente.`, life: 3000 });
        }
    };
    // Actualizar un rol
    const updateRole = async (id, updatedData) => {
        try {
            const response = await fetch(`${API_USERS_URL}/roles/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el rol');
            }
            fetchRoles(); // Refrescar la lista después de actualizar
            toast.current.show({ severity: 'success', summary: 'Success', detail: `Rol actualizado correctamente`, life: 3000 });

        }
        catch (error) {
            console.error('Error al actualizar el rol en el servidor:', error);
            alert('No se pudo actualizar el rol. Por favor, inténtalo nuevamente.');

        }
    };

    // Eliminar roles seleccionados
    const deleteSelectedRoles = async () => {
        try {
            const response = await fetch(`${API_USERS_URL}/roles`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roleIds: selectedRoles }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Error desconocido al eliminar roles';
                throw new Error(errorMessage);
            }

            setRoles((prevRoles) => prevRoles.filter((role) => !selectedRoles.includes(role.id)));
            setSelectedRoles([]); // Limpia la selección después de eliminar
            toast.current.show({ severity: 'success', summary: 'Success', detail: `Rol eliminado correctamente`, life: 3000 });

        } catch (error) {
            console.error('Error al eliminar roles:', error);

            if (error.message.includes('Unexpected token')) {

                toast.current.show({ severity: 'error', summary: 'Error', detail: `Error desconocido. Revisa que el rol no esté asignado a un usuario.`, life: 3000 });

            } else {

                toast.current.show({ severity: 'error', summary: 'Error', detail: `No se pudieron eliminar los roles. Razón: ${error.message}`, life: 3000 });


            }
        }
    };

    // Abrir modal de permisos
    const handleOpenModal = (role) => setModalRole(role);

    // Cerrar modal de permisos
    const handleCloseModal = () => setModalRole(null);

    // Actualizar permisos después de modificar
    const handlePermissionsUpdated = (roleId, updatedPermissions) => {
        setRoles((prevRoles) =>
            prevRoles.map((role) =>
                role.id === roleId ? { ...role, permissions: updatedPermissions } : role
            )
        );

        toast.current.show({ severity: 'success', summary: 'Success', detail: `Permisos actualizados correctamente.`, life: 3000 });


    };

    return (
        <div className={styles.pageContainer}>
            <Toast ref={toast} />
            <Toolbar
                selectedRoles={roles.filter((role) => selectedRoles.includes(role.id))} // Pasa los roles seleccionados
                onDeleteSelected={deleteSelectedRoles}
                disableDelete={selectedRoles.length === 0} // Deshabilitar si no hay roles seleccionados
                onRoleCreated={handleRoleCreated} // Pasa la función como prop
            />
            {loading ? (
                <div>Cargando roles...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <RolesTable
                    roles={roles}
                    selectedRoles={selectedRoles}
                    setSelectedRoles={setSelectedRoles}
                    editingRoleId={editingRoleId}
                    setEditingRoleId={setEditingRoleId}
                    editValues={editValues}
                    setEditValues={setEditValues}
                    setRoles={setRoles}
                    updateRole={updateRole}
                    onOpenModal={handleOpenModal}
                />
            )}
            {modalRole && (
                <AssignPermissionsModal
                    role={modalRole}
                    onClose={handleCloseModal}
                    onPermissionsUpdated={handlePermissionsUpdated}
                />
            )}

        </div>
    );
};

export default CrudRoles;
