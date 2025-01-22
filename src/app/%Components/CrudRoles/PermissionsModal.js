import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Checkbox,
    Grid,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    Typography,
} from '@mui/material';
import { API_USERS_URL } from '../../%Config/apiConfig';

const AssignPermissionsModal = ({ role, onClose, onPermissionsUpdated }) => {
    const [permissions, setPermissions] = useState([]); // Todos los permisos disponibles
    const [selectedPermissions, setSelectedPermissions] = useState([]); // IDs de los permisos seleccionados
    const [searchTerm, setSearchTerm] = useState(''); // Texto de búsqueda
    const [error, setError] = useState(''); // Mensaje de error para la validación

    // Cargar permisos y mapear los seleccionados
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await fetch(`${API_USERS_URL}/permissions`, {
                    credentials: 'include',
                });
                if (!response.ok) throw new Error('Error al obtener permisos');
                const data = await response.json();
                setPermissions(data);

                // Mapeo inicial: convertir los permisos actuales del rol (nombres) a IDs
                if (role?.permissions) {
                    const permissionIds = data
                        .filter((perm) => role.permissions.includes(perm.acceso)) // Mapeamos nombres a IDs
                        .map((perm) => perm.permiso_id);
                    setSelectedPermissions(permissionIds);
                }
            } catch (error) {
                console.error('Error al cargar permisos:', error);
            }
        };

        if (role) fetchPermissions();
    }, [role]);

    // Manejar la selección o deselección de un permiso
    const handleTogglePermission = (permissionId) => {
        setError(''); // Limpiar el mensaje de error al seleccionar permisos
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId) // Quitar el ID si ya estaba seleccionado
                : [...prev, permissionId] // Agregar el ID si no estaba seleccionado
        );
    };

    // Guardar cambios y enviar los IDs al backend
    const handleSave = async () => {
        if (selectedPermissions.length === 0) {
            setError('Debes asignar al menos un permiso.');
            return; // No continuar si no hay permisos seleccionados
        }

        try {
            const response = await fetch(`${API_USERS_URL}/roles/${role.id}/assign-permissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ permissions: selectedPermissions }), // Enviar solo IDs
            });

            if (!response.ok) throw new Error('Error al asignar permisos');

            // Actualizamos el rol con los permisos asignados (solo nombres para mostrar en la fila)
            const updatedPermissions = permissions
                .filter((perm) => selectedPermissions.includes(perm.permiso_id))
                .map((perm) => perm.acceso);

            // Notificar al componente principal sobre los permisos actualizados
            onPermissionsUpdated(role.id, updatedPermissions);

            onClose(); // Cerrar el modal después de guardar
        } catch (error) {
            console.error('Error al asignar permisos:', error);
        }
    };

    const filteredPermissions = permissions.filter(
        (permission) =>
            permission.acceso.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={Boolean(role)} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Asignar Permisos - {role?.name}</DialogTitle>
            <DialogContent>
                {/* Barra de búsqueda */}
                <TextField
                    label="Buscar permisos"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Lista de permisos */}
                <Grid container spacing={2}>
                    {filteredPermissions.map((permission) => (
                        <Grid item xs={12} sm={6} md={4} key={permission.permiso_id}>
                            <ListItem
                                button
                                onClick={() => handleTogglePermission(permission.permiso_id)} // Usar ID directamente
                                style={{ padding: '8px 16px' }}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        checked={selectedPermissions.includes(permission.permiso_id)} // Comparar con IDs
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={permission.acceso}
                                    secondary={permission.descripcion}
                                    style={{
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'normal',
                                    }}
                                />
                            </ListItem>
                        </Grid>
                    ))}
                </Grid>

                {/* Mensaje de error */}
                {error && (
                    <Typography color="error" style={{ marginTop: '16px', fontSize: '0.9rem' }}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    color="primary"
                    disabled={selectedPermissions.length === 0} // Deshabilitar si no hay permisos seleccionados
                >
                    Guardar Permisos
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignPermissionsModal;
