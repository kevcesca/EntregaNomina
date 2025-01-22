import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Grid,
    TextField,
    FormHelperText, // Importar el componente FormHelperText para mostrar mensajes de error
} from '@mui/material';
import { API_USERS_URL } from '../../%Config/apiConfig';
import styles from '../page.module.css'

const AssignRolesModal = ({ isOpen, onClose, user, onRolesUpdated }) => {
    const [roles, setRoles] = useState([]); // Todos los roles disponibles
    const [selectedRoles, setSelectedRoles] = useState([]); // Roles seleccionados para el usuario
    const [searchTerm, setSearchTerm] = useState(''); // Texto de búsqueda
    const [error, setError] = useState(''); // Estado para el mensaje de error

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch(`${API_USERS_URL}/roles-permissions`);
                if (!response.ok) throw new Error('Error al obtener roles');
                const data = await response.json();
                setRoles(data);

                // Seleccionar roles asignados por defecto
                if (user?.Rol) {
                    const assignedRoles = user.Rol.split(',').map((role) => role.trim());
                    const defaultSelected = data
                        .filter((role) => assignedRoles.includes(role.nombre_rol))
                        .map((role) => role.rol_id);
                    setSelectedRoles(defaultSelected);
                }
            } catch (error) {
                console.error('Error al cargar los roles:', error);
            }
        };

        if (isOpen) {
            fetchRoles();
        }
    }, [isOpen, user]);

    const handleToggleRole = (roleId) => {
        setSelectedRoles((prevSelected) =>
            prevSelected.includes(roleId)
                ? prevSelected.filter((id) => id !== roleId) // Remover si ya está seleccionado
                : [...prevSelected, roleId] // Agregar si no está seleccionado
        );
    };

    const handleUpdateRoles = async () => {
        if (selectedRoles.length === 0) {
            setError('Debe seleccionar al menos un rol para continuar.');
            return; // No continuar si no se seleccionaron roles
        }

        try {
            const response = await fetch(`${API_USERS_URL}/users/${user['ID Empleado']}/assign-roles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roles: selectedRoles }),
            });

            if (!response.ok) throw new Error('Error al actualizar roles');

            const updatedRoles = await response.json();
            onRolesUpdated(updatedRoles.data.roles); // Notificar cambios al componente padre
            onClose(); // Cerrar modal
        } catch (error) {
            console.error('Error al asignar roles:', error);
        }
    };

    // Filtrar roles según el texto ingresado en la barra de búsqueda
    const filteredRoles = roles.filter((role) =>
        role.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.descripcion_rol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Asignar Roles</DialogTitle>
            <DialogContent>
                {/* Barra de búsqueda */}
                <TextField
                    label="Buscar roles"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Actualizar el estado del término de búsqueda
                />
                {/* Lista de roles en columnas */}
                <Grid container spacing={2}>
                    {filteredRoles.map((role) => (
                        <Grid item xs={12} sm={6} md={4} key={role.rol_id}>
                            <ListItem
                                button
                                onClick={() => handleToggleRole(role.rol_id)}
                                style={{ padding: '8px 16px' }}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        checked={selectedRoles.includes(role.rol_id)}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    className={styles.wordNoWrap}
                                    primary={role.nombre_rol}
                                    secondary={role.descripcion_rol}
                                />
                            </ListItem>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions>
                {/* Mostrar mensaje de error si no se selecciona ningún rol */}
                {error && <FormHelperText className={styles.sticky} error>{error}</FormHelperText>}
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button onClick={handleUpdateRoles} color="primary">
                    Actualizar Roles
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignRolesModal;
