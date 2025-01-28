import { Toast } from 'primereact/toast';
import React, { useState, useEffect, useRef } from 'react';
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
import AsyncButton from '../AsyncButton/AsyncButton';


const CreateRoleModal = ({ isOpen, onClose, onRoleCreated }) => {
    const [permissions, setPermissions] = useState([]); // Todos los permisos disponibles
    const [selectedPermissions, setSelectedPermissions] = useState([]); // IDs de los permisos seleccionados
    const [searchTerm, setSearchTerm] = useState(''); // Texto de búsqueda
    const [roleData, setRoleData] = useState({ name: '', description: '' }); // Datos del nuevo rol
    const [showValidationMessage, setShowValidationMessage] = useState(false); // Mostrar mensaje de validación

    // Cargar permisos disponibles al abrir el modal
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await fetch(`${API_USERS_URL}/permissions`, {
                    credentials: 'include',
                });
                if (!response.ok) throw new Error('Error al obtener permisos');
                const data = await response.json();
                setPermissions(data);
            } catch (error) {
                console.error('Error al cargar permisos:', error);
            }
        };

        if (isOpen) {
            fetchPermissions();
        }
    }, [isOpen]);

    // Restablecer formulario al abrir el modal
    useEffect(() => {
        if (isOpen) {
            setRoleData({ name: '', description: '' }); // Vaciar campos de texto
            setSelectedPermissions([]); // Deseleccionar permisos
            setSearchTerm(''); // Limpiar búsqueda
            setShowValidationMessage(false); // Ocultar mensaje de validación
        }
    }, [isOpen]);

    // Manejar selección de permisos
    const handleTogglePermission = (permissionId) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId) // Deseleccionar
                : [...prev, permissionId] // Seleccionar
        );
    };

    // Manejar el cambio en los inputs del nombre y descripción del rol
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoleData((prev) => ({ ...prev, [name]: value }));
    };
    // Guardar el nuevo rol
    const handleSave = async () => {
        // Eliminar espacios al final del nombre del rol
        const trimmedName = roleData.name.trim();

        // Validar que todos los campos estén completos
        if (!trimmedName || !roleData.description || selectedPermissions.length === 0) {
            setShowValidationMessage(true); // Mostrar mensaje de validación
            return;
        }

        try {
            const response = await fetch(`${API_USERS_URL}/roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_rol: trimmedName, // Usar el nombre limpio
                    descripcion_rol: roleData.description,
                    permisos: selectedPermissions,
                }),
            });

            if (!response.ok) throw new Error('Error al crear el rol');

            const newRole = await response.json();

            onRoleCreated(newRole.data); // Llama a handleRoleCreated en CrudRoles
            onClose(); // Cierra el modal
        } catch (error) {
            console.error('Error al crear el rol:', error);
            alert("Nombre de rol ya registrado")
        }

    };

    // Filtrar permisos según el término de búsqueda
    const filteredPermissions = permissions.filter(
        (permission) =>
            (permission.acceso?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (permission.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Crear Nuevo Rol</DialogTitle>
            <DialogContent>
                {/* Mostrar mensaje de validación si hay campos vacíos */}
                {showValidationMessage && (
                    <Typography color="error" variant="body2" sx={{ marginBottom: 2 }}>
                        Por favor, completa todos los campos y selecciona al menos un permiso.
                    </Typography>
                )}

                {/* Inputs para nombre y descripción */}
                <TextField
                    label="Nombre del Rol"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="name"
                    value={roleData.name}
                    onChange={handleInputChange}
                />
                <TextField
                    label="Descripción del Rol"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    name="description"
                    value={roleData.description}
                    onChange={handleInputChange}
                />

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
                                onClick={() => handleTogglePermission(permission.permiso_id)}
                                style={{ padding: '8px 16px' }}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        checked={selectedPermissions.includes(permission.permiso_id)}
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
            </DialogContent>
            <DialogActions>

                <Button
                    onClick={onClose}
                    color="secondary"
                >
                    Cancelar
                </Button>

                <Button
                    onClick={handleSave}
                    color="primary"
                    disabled={
                        roleData.name.trim() === '' || // Verifica que el nombre no esté vacío
                        roleData.description.trim() === '' || // Verifica que la descripción no esté vacía
                        selectedPermissions.length === 0 // Verifica que haya al menos un permiso seleccionado
                    }
                >
                    Crear Rol
                </Button>

            </DialogActions>
        </Dialog>
    );
};

export default CreateRoleModal;
