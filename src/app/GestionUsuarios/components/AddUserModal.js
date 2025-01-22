import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Autocomplete, Typography } from '@mui/material';
import styles from '../page.module.css'; // Archivo de estilos
import { API_USERS_URL } from '../../%Config/apiConfig';

const AddUserModal = ({ isOpen, onClose, onUserAdded, currentUser }) => {
    const [formData, setFormData] = useState({
        id_empleado: '',
        nombre_usuario: '',
        correo_usuario: '',
        contrasena_usuario: 'Azcapotzalco1!', // Contraseña por defecto
        asigno: currentUser, // Asigna el usuario actual por defecto
    });
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedEmployeeName, setSelectedEmployeeName] = useState(''); // Nombre del empleado seleccionado
    const [emailError, setEmailError] = useState(''); // Estado para el mensaje de error del correo
    const [usernameError, setUsernameError] = useState(''); // Estado para el mensaje de error del nombre de usuario

    useEffect(() => {
        const fetchEmployeeOptions = async () => {
            try {
                const response = await fetch(`${API_USERS_URL}/employee-ids-with-names`);
                if (!response.ok) throw new Error('Error al obtener empleados');
                const data = await response.json();
                setEmployeeOptions(data); // [{ id_empleado, nombre_completo }]
            } catch (error) {
                console.error('Error al cargar empleados:', error);
            }
        };

        fetchEmployeeOptions();
    }, []);

    const handleEmployeeChange = (event, value) => {
        setFormData((prev) => ({ ...prev, id_empleado: value?.id_empleado || '' }));
        setSelectedEmployeeName(value?.nombre_completo || ''); // Actualizar el nombre del empleado seleccionado
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para un correo válido
        if (email.length > 30) {
            return 'El correo no puede tener más de 30 caracteres.';
        } else if (!emailRegex.test(email)) {
            return 'Por favor, ingresa un correo válido.';
        }
        return ''; // Sin errores
    };

    const validateUsername = (username) => {
        if (username.length > 15) {
            return 'El nombre de usuario no puede tener más de 15 caracteres.';
        }
        return ''; // Sin errores
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'correo_usuario') {
            const lowercaseEmail = value.toLowerCase();
            setFormData((prev) => ({ ...prev, [name]: lowercaseEmail }));

            const error = validateEmail(lowercaseEmail); // Validar el correo ingresado
            setEmailError(error);
        } else if (name === 'nombre_usuario') {
            setFormData((prev) => ({ ...prev, [name]: value }));

            const error = validateUsername(value); // Validar el nombre de usuario
            setUsernameError(error);
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (emailError || usernameError) {
            alert('Por favor, corrige los errores antes de continuar.');
            return;
        }

        try {
            const response = await fetch(`${API_USERS_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Error al registrar el usuario');
            console.log('Usuario registrado con éxito');

            onUserAdded(); // Actualiza la lista de usuarios
            onClose(); // Cierra el modal
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
        }
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box className={styles.modal}>
                <h2>Registrar Usuario</h2>
                <form onSubmit={handleSubmit}>
                    <Autocomplete
                        options={employeeOptions}
                        getOptionLabel={(option) => `${option.id_empleado} - ${option.nombre_completo}`}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="ID Empleado"
                                name="id_empleado"
                                required
                                fullWidth
                                margin="normal"
                            />
                        )}
                        onChange={handleEmployeeChange}
                        value={
                            employeeOptions.find(
                                (option) => option.id_empleado === formData.id_empleado
                            ) || null
                        }
                        isOptionEqualToValue={(option, value) => option.id_empleado === value.id_empleado}
                    />

                    <TextField
                        label="Nombre del Empleado"
                        value={selectedEmployeeName}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <TextField
                        label="Nombre de Usuario"
                        name="nombre_usuario"
                        value={formData.nombre_usuario}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        margin="normal"
                        error={Boolean(usernameError)}
                        helperText={usernameError} // Mostrar mensaje de error del nombre de usuario
                    />

                    <TextField
                        label="Correo Electrónico"
                        name="correo_usuario"
                        value={formData.correo_usuario}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        margin="normal"
                        error={Boolean(emailError)}
                        helperText={emailError} // Mostrar mensaje de error del correo
                    />

                    <label className={styles.provisionalPasswordMessage}>
                        Contraseña provisional: Por seguridad, cámbiala en tu primer acceso.
                    </label>

                    <TextField
                        label="Contraseña"
                        name="contrasena_usuario"
                        value={formData.contrasena_usuario}
                        fullWidth
                        required
                        margin="normal"
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <TextField
                        label="Asignó"
                        name="asigno"
                        value={formData.asigno}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            readOnly: true,
                        }}
                    />

                    <Button type="submit" variant="contained" color="primary">
                        Registrar
                    </Button>
                    <Button onClick={onClose} variant="outlined" color="secondary" style={{ marginLeft: '10px' }}>
                        Cancelar
                    </Button>
                </form>
            </Box>
        </Modal>
    );
};

export default AddUserModal;
