import React, { useState } from 'react';
import { Checkbox, TextField, TablePagination } from '@mui/material';
import styles from './CrudRoles.module.css';
import RoleRow from './RoleRow'; // Importamos el componente externo de RoleRow

const RolesTable = ({
    roles,
    selectedRoles,
    setSelectedRoles,
    setRoles,
    updateRole,
    onOpenModal,
}) => {
    const [searchTerm, setSearchTerm] = useState(''); // Estado para la búsqueda
    const [page, setPage] = useState(0); // Estado para la página actual
    const [rowsPerPage, setRowsPerPage] = useState(5); // Estado para las filas por página
    const [editingRoleId, setEditingRoleId] = useState(null); // ID del rol en edición
    const [editValues, setEditValues] = useState({ name: '', description: '' }); // Valores en edición

    // Manejar búsqueda
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
        setPage(0); // Reiniciar a la primera página al buscar
    };

    // Filtrar roles según el término de búsqueda
    const filteredRoles = roles.filter((role) =>
        Object.values(role).some((value) => {
            if (Array.isArray(value)) {
                return value.some((item) =>
                    item.toString().toLowerCase().includes(searchTerm)
                );
            }
            return value.toString().toLowerCase().includes(searchTerm);
        })
    );

    // Calcular los roles que se mostrarán en la página actual
    const displayedRoles = filteredRoles.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Manejar cambio de página
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Manejar cambio de filas por página
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reiniciar a la primera página
    };

    // Manejar selección de un rol
    const handleToggleRole = (roleId) => {
        setSelectedRoles((prevSelected) =>
            prevSelected.includes(roleId)
                ? prevSelected.filter((id) => id !== roleId)
                : [...prevSelected, roleId]
        );
    };

    // Manejar selección de todos los roles visibles en la página
    const handleToggleAll = (event) => {
        if (event.target.checked) {
            const allRoleIds = displayedRoles.map((role) => role.id);
            setSelectedRoles(allRoleIds);
        } else {
            setSelectedRoles([]);
        }
    };

    const allSelected =
        displayedRoles.length > 0 &&
        selectedRoles.length === displayedRoles.length;

    return (
        <div>
            {/* Barra de búsqueda */}
            <TextField
                label="Buscar roles"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchTerm}
                onChange={handleSearchChange}
            />

            {/* Tabla de roles */}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>
                            <Checkbox
                                checked={allSelected}
                                onChange={handleToggleAll}
                                indeterminate={
                                    selectedRoles.length > 0 &&
                                    selectedRoles.length < displayedRoles.length
                                }
                            />
                        </th>
                        <th>ID</th>
                        <th>Nombre del Rol</th>
                        <th>Descripción</th>
                        <th>Permisos</th>
                        {editingRoleId && <th>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {displayedRoles.map((role) => (
                        <RoleRow
                            key={role.id}
                            role={role}
                            isSelected={selectedRoles.includes(role.id)}
                            onToggleRole={() => handleToggleRole(role.id)}
                            editingRoleId={editingRoleId}
                            setEditingRoleId={setEditingRoleId}
                            editValues={editValues}
                            setEditValues={setEditValues}
                            updateRole={updateRole}
                            setRoles={setRoles}
                            onOpenModal={onOpenModal}
                        />
                    ))}
                </tbody>
            </table>

            {/* Paginación */}
            <TablePagination
                component="div"
                count={filteredRoles.length} // Total de roles filtrados
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]} // Opciones de filas por página
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
            />
        </div>
    );
};

export default RolesTable;
