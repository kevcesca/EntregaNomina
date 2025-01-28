import React, { useState } from 'react';
import { Checkbox, IconButton, Tooltip, TextField, Button, TablePagination } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import styles from './CrudRoles.module.css';

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
            // Verifica si el valor actual es un array (como "permissions") o un string
            if (Array.isArray(value)) {
                return value.some((item) =>
                    item.toString().toLowerCase().includes(searchTerm)
                );
            }
            return value.toString().toLowerCase().includes(searchTerm);
        })
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

    // Calcular los roles que se mostrarán en la página actual
    const displayedRoles = filteredRoles.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

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

    // Componente interno para una fila de la tabla (RoleRow)
    const RoleRow = ({
        role,
        isSelected,
        onToggleRole,
    }) => {
        const startEditing = () => {
            setEditingRoleId(role.id);
            setEditValues({ name: role.name, description: role.description });
        };

        const cancelEditing = () => {
            setEditingRoleId(null);
            setEditValues({ name: '', description: '' });
        };

        const saveEditing = () => {
            setRoles((prevRoles) =>
                prevRoles.map((r) =>
                    r.id === role.id
                        ? { ...r, name: editValues.name, description: editValues.description }
                        : r
                )
            );
            updateRole(role.id, {
                nombre_rol: editValues.name,
                descripcion_rol: editValues.description,
            });
            setEditingRoleId(null);
        };

        return (
            <tr>
                <td>
                    <Checkbox checked={isSelected} onChange={onToggleRole} />
                </td>
                <td>{role.id}</td>
                <td onDoubleClick={startEditing}>
                    {editingRoleId === role.id ? (
                        <TextField
                            variant="outlined"
                            size="small"
                            value={editValues.name}
                            onChange={(e) =>
                                setEditValues((prev) => ({ ...prev, name: e.target.value }))
                            }
                            autoFocus
                        />
                    ) : (
                        role.name
                    )}
                </td>
                <td onDoubleClick={startEditing}>
                    {editingRoleId === role.id ? (
                        <TextField
                            variant="outlined"
                            size="small"
                            value={editValues.description}
                            onChange={(e) =>
                                setEditValues((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                    ) : (
                        role.description
                    )}
                </td>
                <td>
                    <div className={styles.permissionsCell}>
                        <span>{role.permissions.join(', ') || 'Sin permisos'}</span>
                        <Tooltip title="Editar permisos">
                            <IconButton
                                className={styles.addPermissionButton}
                                onClick={() => onOpenModal(role)}
                            >
                                <AddCircleOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                </td>
                {editingRoleId === role.id && (
                    <td>
                        <div className={styles.botonesAceptCancel}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={saveEditing}
                                className={styles.buttonSave}
                            >
                                Guardar
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                onClick={cancelEditing}
                                className={styles.buttonCancel}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </td>
                )}
            </tr>
        );
    };

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
