import React, { useState, useEffect, useRef } from 'react';
import { Modal, Box, TextField, Button, Autocomplete } from '@mui/material';
import { Toast } from 'primereact/toast';
import styles from '../page.module.css'; // Archivo de estilos
import { API_USERS_URL } from '../../%Config/apiConfig';
import AsyncButton from '../../%Components/AsyncButton/AsyncButton';

const AddUserModal = ({ isOpen, onClose, onUserAdded, currentUser }) => {
    const toast = useRef(null); // Referencia al Toast
    const [formData, setFormData] = useState({
        id_empleado: '',
        nombre_usuario: '',
        correo_usuario: '',
        contrasena_usuario: 'Azcapotzalco1!', // Contraseña por defecto
        asigno: currentUser, // Asigna el usuario actual por defecto
    });
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');

    useEffect(() => {
        const fetchEmployeeOptions = async () => {
            try {
                const response = await fetch(`${API_USERS_URL}/employee-ids-with-names`);
                if (!response.ok) throw new Error('Error al obtener empleados');
                const data = await response.json();
                setEmployeeOptions(data);
            } catch (error) {
                console.error('Error al cargar empleados:', error);
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los empleados. Intenta nuevamente.',
                    life: 3000,
                });
            }
        };

        fetchEmployeeOptions();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'correo_usuario') {
            const lowercaseEmail = value.toLowerCase();
            setFormData((prev) => ({ ...prev, [name]: lowercaseEmail }));

            const error = validateEmail(lowercaseEmail);
            setEmailError(error);
        } else if (name === 'nombre_usuario') {
            setFormData((prev) => ({ ...prev, [name]: value }));

            const error = validateUsername(value);
            setUsernameError(error);
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleEmployeeChange = (event, value) => {
        setFormData((prev) => ({ ...prev, id_empleado: value?.id_empleado || '' }));
        setSelectedEmployeeName(value?.nombre_completo || ''); // Actualiza correctamente el nombre del empleado
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (emailError || usernameError) {
            toast.current.show({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Por favor, corrige los errores antes de continuar.',
                life: 3000,
            });
            return;
        }

        try {
            const response = await fetch(`${API_USERS_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                // Obtener el texto de la respuesta de error
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }

            // Mensaje de éxito
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Usuario registrado correctamente.',
                life: 3000,
            });

            onUserAdded(); // Actualiza la lista de usuarios
            onClose(); // Cierra el modal
        } catch (error) {
            console.error('Error al registrar el usuario:', error.message);

            // Mostrar el mensaje de error desde el servidor
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Ocurrió un error inesperado. Intenta nuevamente.',
                life: 5000,
            });
        }
    };

    return (
        <div className={styles.container}>
            <Toast className={styles.front} ref={toast} position="top-right" />
            <Modal open={isOpen} onClose={onClose}>
                <Box className={styles.modal}>

                    <h2>Registrar Usuario</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Autocomplete para seleccionar empleado */}
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
                            onChange={handleEmployeeChange} // Actualiza el empleado seleccionado
                            value={
                                employeeOptions.find(
                                    (option) => option.id_empleado === formData.id_empleado
                                ) || null
                            }
                            isOptionEqualToValue={(option, value) =>
                                option.id_empleado === value.id_empleado
                            }
                        />

                        {/* Mostrar el nombre del empleado seleccionado */}
                        <TextField
                            label="Nombre del Empleado"
                            value={selectedEmployeeName} // Sincroniza el valor del nombre
                            fullWidth
                            margin="normal"
                            InputProps={{
                                readOnly: true, // Campo solo de lectura
                            }}
                        />

                        {/* Resto del formulario */}
                        <TextField
                            label="Nombre de Usuario"
                            name="nombre_usuario"
                            value={formData.nombre_usuario}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            error={Boolean(usernameError)}
                            helperText={usernameError}
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
                            helperText={emailError}
                        />
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

                        {/* Botones */}
                        <AsyncButton
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit} // Pasa directamente la función de envío
                        >
                            Registrar
                        </AsyncButton>

                        <Button
                            onClick={onClose}
                            variant="outlined"
                            color="secondary"
                            style={{ marginLeft: '10px' }}
                        >
                            Cancelar
                        </Button>
                    </form>
                </Box>
            </Modal>
        </div>

    );
};

export default AddUserModal;