import React from 'react';
import { Checkbox, IconButton, Tooltip, TextField, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import styles from './CrudRoles.module.css';

const RoleRow = ({
    role,
    isSelected,
    onToggleRole,
    setRoles,
    editingRoleId,
    setEditingRoleId,
    editValues,
    setEditValues,
    updateRole,
    onOpenModal,
}) => {
    // Inicia la edición del rol
    const startEditing = () => {
        setEditingRoleId(role.id);
        setEditValues({ name: role.name, description: role.description });
    };

    // Cancela la edición
    const cancelEditing = () => {
        setEditingRoleId(null);
        setEditValues({ name: '', description: '' });
    };

    // Guarda los cambios realizados al rol
    const saveEditing = () => {
        // Actualiza el estado local
        setRoles((prevRoles) =>
            prevRoles.map((r) =>
                r.id === role.id
                    ? { ...r, name: editValues.name, description: editValues.description }
                    : r
            )
        );
        // Llama a la función para actualizar en el backend
        updateRole(role.id, {
            nombre_rol: editValues.name,
            descripcion_rol: editValues.description,
        });
        setEditingRoleId(null); // Finaliza la edición
    };

    return (
        <tr>
            {/* Checkbox de selección */}
            <td>
                <Checkbox
                    checked={isSelected}
                    onChange={onToggleRole}
                />
            </td>

            {/* ID del rol */}
            <td>{role.id}</td>

            {/* Campo de nombre del rol */}
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

            {/* Campo de descripción del rol */}
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

            {/* Permisos del rol */}
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

            {/* Botones de acción para guardar/cancelar */}
            {editingRoleId === role.id && (
                <td>
                    <div className={styles.botonesAceptCancel}>
                        <Tooltip title="Guardar cambios">
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={saveEditing}
                                startIcon={<SaveIcon />}
                                className={styles.buttonSave}
                            >
                                Guardar
                            </Button>
                        </Tooltip>
                        <Tooltip title="Cancelar edición">
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                onClick={cancelEditing}
                                startIcon={<CancelIcon />}
                                className={styles.buttonCancel}
                            >
                                Cancelar
                            </Button>
                        </Tooltip>
                    </div>
                </td>
            )}
        </tr>
    );
};

export default RoleRow;
