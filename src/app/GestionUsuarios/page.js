'use client';

import React, { useState } from 'react';
import { TextField, Button, TablePagination } from '@mui/material';
import styles from './page.module.css';
import AddUserModal from './components/AddUserModal';
import UserTableRow from './components/UserTableRow';
import UserActionsMenu from './components/UserActionsMenu';
import AssignRolesModal from './components/AssignRolesModal'; // Modal para asignar roles
import useUsers from './components/useUsers';
import { useAuth } from '../context/AuthContext';
import { API_USERS_URL } from '../%Config/apiConfig';
import AsyncButton from '../%Components/AsyncButton/AsyncButton';
import ChangePasswordModal from './components/ChangePasswordModal';
import ExportTableComponent from './components/ExportTableComponent'; // Importar el componente de exportación
import ConfirmToggleUsersModal from './components/ConfirmToggleUsersModal';

const UserTable = () => {
    const { users, setUsers, fetchUsers, toggleUserStatus } = useUsers(); // Incluimos `setUsers` para actualizar la lista localmente
    const { user: currentUser } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editedFields, setEditedFields] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRolesModalOpen, setIsRolesModalOpen] = useState(false); // Estado del modal de roles
    const [selectedUsers, setSelectedUsers] = useState([]); // Manejo de selección de usuarios
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Número de usuarios por página
    const [isExportModalOpen, setIsExportModalOpen] = useState(false); // Estado para el modal de exportación
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Estado para abrir/cerrar el modal
    const [isEnabling, setIsEnabling] = useState(true); // Indica si estamos habilitando o deshabilitando usuarios
    const [page, setPage] = useState(0); // Página actual
    const [rowsPerPage, setRowsPerPage] = useState(10); // Número de filas por página


    const openMenu = Boolean(anchorEl);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const displayedUsers = filteredUsers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reiniciar a la primera página
    };


    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
    
        // Filtrar usuarios basándonos en cualquier propiedad
        setFilteredUsers(
            users.filter((user) =>
                Object.values(user).some((value) =>
                    String(value).toLowerCase().includes(query)
                )
            )
        );
    
        setPage(0); // Reiniciar a la primera página
    };    

    // Función para abrir el modal de cambio de contraseña
    const handleChangePassword = () => {
        setIsPasswordModalOpen(true);
        setAnchorEl(null); // Cerrar el menú de opciones
    };

    // Abrir el menú contextual de opciones
    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleExportOpen = () => setIsExportModalOpen(true); // Abrir modal de exportación
    const handleExportClose = () => setIsExportModalOpen(false); // Cerrar modal de exportación
    // Definimos las columnas y filas para el modal de exportación
    const columns = [
        { label: 'ID Empleado', accessor: 'ID Empleado' },
        { label: 'Nombre Empleado', accessor: 'Nombre Empleado' },
        { label: 'Nombre Usuario', accessor: 'Nombre de Usuario' },
        { label: 'Email', accessor: 'Email' },
        { label: 'Rol', accessor: 'Rol' },
        { label: 'Fecha de Alta', accessor: 'Fecha de Alta' },
        { label: 'Asignó', accessor: 'Asignó' },
    ];

    const rows = users.map(user => ({
        'ID Empleado': user['ID Empleado'],
        'Nombre Empleado': user['Nombre Empleado'],
        'Nombre de Usuario': user['Nombre de Usuario'],
        Email: user.Email,
        Rol: user.Rol,
        'Fecha de Alta': user['Fecha de Alta'],
        'Asignó': user['Asignó'],
    }));

    // Cerrar el menú contextual de opciones
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    // Selección global de usuarios
    const handleSelectAll = (checked) => {
        if (checked) {
            const allUserIds = users.map((user) => user['ID Empleado']);
            setSelectedUsers(allUserIds);
        } else {
            setSelectedUsers([]);
        }
    };

    // Selección individual de usuarios
    const handleSelectUser = (userId) => {
        setSelectedUsers((prevSelected) =>
            prevSelected.includes(userId)
                ? prevSelected.filter((id) => id !== userId)
                : [...prevSelected, userId]
        );
    };

    // Usuarios a habilitar y deshabilitar
    const usersToEnable = selectedUsers.filter((userId) => {
        const user = users.find((u) => u['ID Empleado'] === userId);
        return user && !user.Activo; // Usuarios deshabilitados
    });

    const usersToDisable = selectedUsers.filter((userId) => {
        const user = users.find((u) => u['ID Empleado'] === userId);
        return (
            user &&
            user.Activo && // Solo usuarios habilitados
            !user.Rol.split(',').some((role) => role.trim() === 'Administrador') // Excluir administradores
        );
    });

    const handleEnableUsers = () => {
        setIsEnabling(true); // Establece que la acción es habilitar
        setIsConfirmModalOpen(true); // Abre el modal de confirmación
    };

    const handleDisableUsers = () => {
        const adminUsers = selectedUsers.filter((userId) => {
            const user = users.find((u) => u['ID Empleado'] === userId);
            return user?.Rol.split(',').some((role) => role.trim() === 'Administrador');
        });

        if (adminUsers.length > 0) {
            alert(
                `Los siguientes usuarios no pueden ser deshabilitados porque son administradores:\n${adminUsers
                    .map((userId) => {
                        const user = users.find((u) => u['ID Empleado'] === userId);
                        return `${user['Nombre Empleado']} (${user['Nombre de Usuario']})`;
                    })
                    .join('\n')}`
            );
        }

        setIsEnabling(false); // Establece que la acción es deshabilitar
        setIsConfirmModalOpen(true); // Abre el modal de confirmación
    };

    // Verificar si todos los usuarios seleccionados están habilitados
    const areAllSelectedUsersActive = selectedUsers.every((userId) => {
        const user = users.find((u) => u['ID Empleado'] === userId);
        return user?.Activo;
    });

    // Acción para habilitar/deshabilitar usuarios seleccionados
    const handleToggleSelectedUsers = () => {
        // Filtrar usuarios seleccionados que tienen el rol de "Administrador"
        const adminUsers = selectedUsers.filter((userId) => {
            const user = users.find((u) => u['ID Empleado'] === userId);
            return user?.Rol.split(',').some((role) => role.trim() === 'Administrador'); // Verifica si "Administrador" está entre los roles
        });

        if (adminUsers.length > 0) {
            alert('No se pueden deshabilitar usuarios con el rol de Administrador.');
            return; // Detiene la operación si hay un administrador seleccionado
        }

        setIsEnabling(!areAllSelectedUsersActive); // Determina si estamos habilitando o deshabilitando
        setIsConfirmModalOpen(true); // Abre el modal de confirmación
    };

    // Entrar en modo edición al hacer doble clic
    const handleDoubleClick = (user, field) => {
        setEditingUser(user['ID Empleado']);
        // Inicializar los campos editables con los valores actuales del usuario
        setEditedFields((prevFields) => ({
            ...prevFields,
            'Nombre de Usuario': user['Nombre de Usuario'],
            Email: user.Email,
        }));
    };

    // Manejar cambios en los campos editables
    const handleInputChange = (field, value) => {
        setEditedFields((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    // Confirmar cambios al editar un usuario
    const handleConfirmEdit = async () => {
        try {
            const updatedDetails = {
                nombre_usuario: editedFields['Nombre de Usuario'],
                correo_usuario: editedFields.Email,
            };

            const response = await fetch(
                `${API_USERS_URL}/users/${editingUser}/update-details`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedDetails),
                }
            );

            if (!response.ok) throw new Error('Error al actualizar los detalles del usuario');

            console.log('Detalles actualizados exitosamente.');
            await fetchUsers(); // Refrescar la lista de usuarios
            setEditingUser(null);
            setEditedFields({});
        } catch (error) {
            console.error('Error al confirmar la edición:', error);
        }
    };

    React.useEffect(() => {
        setFilteredUsers(users);
    }, [users]);

    const confirmToggleUsers = async () => {
        try {
            const targetUsers = isEnabling ? usersToEnable : usersToDisable; // Filtrar según la acción
            for (const userId of targetUsers) {
                await toggleUserStatus(userId); // Cambia el estado de cada usuario
            }
            await fetchUsers(); // Refresca la lista de usuarios
            setSelectedUsers([]); // Limpia la selección
        } catch (error) {
            console.error('Error al cambiar el estado de los usuarios:', error);
        } finally {
            setIsConfirmModalOpen(false); // Cierra el modal
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Gestión de Usuarios</h2>
            <div className={styles.buttons}>
                <div>
                    <AsyncButton
                        variant="contained"
                        color="primary"
                        onClick={() => setIsModalOpen(true)}
                        style={{ marginBottom: '10px' }}
                    >
                        Añadir Usuario
                    </AsyncButton>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleExportOpen}
                        style={{ marginBottom: '10px', marginLeft: '10px' }}
                        disabled={!selectedUsers || !selectedUsers.length}
                    >
                        Exportar Datos
                    </Button>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <AsyncButton
                        variant="contained"
                        color="primary"
                        onClick={handleEnableUsers}
                        disabled={usersToEnable.length === 0} // Deshabilitado si no hay usuarios deshabilitados seleccionados
                        style={{ marginRight: '10px' }}
                    >
                        Habilitar Usuarios
                    </AsyncButton>
                    <AsyncButton
                        variant="contained"
                        color="secondary"
                        onClick={handleDisableUsers}
                        disabled={usersToDisable.length === 0} // Deshabilitado si no hay usuarios habilitados seleccionados
                    >
                        Deshabilitar Usuarios
                    </AsyncButton>
                </div>
            </div>

            <div className={styles.searchBar}>
                <TextField
                    label="Buscar usuario"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={styles.searchField}
                />
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={selectedUsers.length === users.length && users.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                        </th>
                        <th>ID Empleado</th>
                        <th>Nombre Empleado</th>
                        <th>Nombre Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th></th> {/* Columna para "Editar roles" */}
                        <th>Fecha de Alta</th>
                        <th>Asignó</th>
                        <th>Opciones</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedUsers.map((user) => (
                        <UserTableRow
                            key={user['ID Empleado']}
                            user={user}
                            isEditing={editingUser === user['ID Empleado']}
                            editedFields={editedFields}
                            onDoubleClick={handleDoubleClick}
                            onInputChange={handleInputChange}
                            onConfirmEdit={handleConfirmEdit}
                            onMenuOpen={(e, user) => {
                                setAnchorEl(e.currentTarget);
                                setSelectedUser(user);
                            }}
                            isSelected={selectedUsers.includes(user['ID Empleado'])}
                            onToggleSelect={() => handleSelectUser(user['ID Empleado'])}
                        />
                    ))}
                </tbody>

            </table>

            <UserActionsMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                onToggleStatus={() => {
                    toggleUserStatus(selectedUser['ID Empleado']);
                    setAnchorEl(null);
                }}
                isActive={selectedUser?.Activo}
                onChangePassword={handleChangePassword} // Pasamos la función para cambiar la contraseña
            />

            {/* Modal para cambiar la contraseña */}
            {selectedUser && (
                <ChangePasswordModal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    userId={selectedUser['ID Empleado']}
                    onPasswordChanged={fetchUsers} // Refrescar los usuarios después de cambiar la contraseña
                />
            )}

            <AddUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserAdded={fetchUsers}
                currentUser={currentUser?.nombre_usuario}
            />

            <ConfirmToggleUsersModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmToggleUsers}
                usersToToggle={
                    isEnabling
                        ? usersToEnable.map((userId) =>
                            users.find((user) => user['ID Empleado'] === userId)
                        )
                        : usersToDisable.map((userId) =>
                            users.find((user) => user['ID Empleado'] === userId)
                        )
                } // Transformar los IDs en objetos de usuario completos
                isEnabling={isEnabling} // Define si la acción es habilitar o deshabilitar
            />

            <AssignRolesModal
                isOpen={isRolesModalOpen}
                onClose={() => setIsRolesModalOpen(false)}
                user={selectedUser}
                onRolesUpdated={(newRoles) => {
                    setUsers((prevUsers) =>
                        prevUsers.map((u) =>
                            u['ID Empleado'] === selectedUser?.['ID Empleado']
                                ? { ...u, Rol: newRoles.join(', ') }
                                : u
                        )
                    );
                    fetchUsers(); // Refrescar usuarios después de actualizar roles
                }}
            />

            <ExportTableComponent
                open={isExportModalOpen}
                onClose={handleExportClose}
                rows={rows}
                columns={columns}
            />

            <TablePagination
                component="div"
                count={filteredUsers.length} // Total de usuarios filtrados
                page={page} // Página actual
                onPageChange={handleChangePage} // Manejador del cambio de página
                rowsPerPage={rowsPerPage} // Filas por página
                onRowsPerPageChange={handleChangeRowsPerPage} // Manejador de cambio de filas por página
                rowsPerPageOptions={[5, 10, 25]} // Opciones disponibles para filas por página
                labelRowsPerPage="Usuarios por página"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
            />

        </div>
    );
};

export default UserTable;