import React from 'react';
import { Checkbox, IconButton, Tooltip, TextField, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import styles from './CrudRoles.module.css';

const RoleRow = React.memo(({
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
    const [editingField, setEditingField] = React.useState(null); // Campo específico en edición (name o description)

    // Inicia la edición del rol en el campo correspondiente
    const startEditing = (field) => {
        setEditingRoleId(role.id);
        setEditingField(field);
        setEditValues({
            name: role.name,
            description: role.description,
        });
    };

    // Cancela la edición
    const cancelEditing = () => {
        setEditingRoleId(null);
        setEditingField(null);
    };

    // Guarda los cambios realizados al rol
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
        setEditingField(null);
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
            <td onDoubleClick={() => startEditing("name")}>
                {editingRoleId === role.id && editingField === "name" ? (
                    <TextField
                        variant="outlined"
                        size="small"
                        value={editValues.name || ""}
                        onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, name: e.target.value }))
                        }
                        autoFocus
                    />
                ) : (
                    role.name
                )}
            </td>

            <td onDoubleClick={() => startEditing("description")}>
                {editingRoleId === role.id && editingField === "description" ? (
                    <TextField
                        variant="outlined"
                        size="small"
                        value={editValues.description || ""}
                        onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, description: e.target.value }))
                        }
                        autoFocus
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
});

export default RoleRow;