import React, { useState } from 'react';
import { TextField, Button, IconButton, Tooltip, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AssignRolesModal from './AssignRolesModal';
import styles from '../page.module.css';

const UserTableRow = ({
    user,
    isEditing,
    editedFields,
    onDoubleClick,
    onInputChange,
    onConfirmEdit,
    onMenuOpen,
    onRolesUpdated,
    isSelected,
    onToggleSelect,
}) => {
    const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
    const [emailError, setEmailError] = useState(''); // Estado para errores en el correo
    const [usernameError, setUsernameError] = useState(''); // Estado para errores en el nombre de usuario

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para correo válido
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

    const handleInputChange = (field, value) => {
        if (field === 'Nombre de Usuario') {
            const error = validateUsername(value);
            setUsernameError(error); // Actualizar el error
            onInputChange(field, value); // Actualizar el valor editado
        } else if (field === 'Email') {
            const lowercaseEmail = value.toLowerCase(); // Convertir a minúsculas
            const error = validateEmail(lowercaseEmail);
            setEmailError(error); // Actualizar el error
            onInputChange(field, lowercaseEmail); // Actualizar el valor editado
        } else {
            onInputChange(field, value);
        }
    };

    const handleConfirmEdit = () => {
        if (emailError || usernameError) {
            alert('Por favor, corrige los errores antes de confirmar.');
            return;
        }
        onConfirmEdit(); // Confirmar cambios
    };

    const handleOpenRolesModal = () => {
        setIsRolesModalOpen(true);
    };

    const handleCloseRolesModal = () => {
        setIsRolesModalOpen(false);
    };

    return (
        <>
            <tr className={!user.Activo ? styles.disabledRow : ''}>
                {/* Checkbox para seleccionar al usuario */}
                <td>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggleSelect}
                    />
                </td>

                <td>{user['ID Empleado']}</td>
                <td>{user['Nombre Empleado']}</td>

                {/* Campo editable: Nombre de Usuario */}
                <td
                    className={styles.rowWidth}
                    onDoubleClick={() => onDoubleClick(user, 'Nombre de Usuario')}
                >
                    {isEditing ? (
                        <TextField
                            variant="outlined"
                            size="small"
                            value={
                                editedFields['Nombre de Usuario'] !== undefined
                                    ? editedFields['Nombre de Usuario']
                                    : user['Nombre de Usuario']
                            }
                            onChange={(e) => handleInputChange('Nombre de Usuario', e.target.value)}
                            className={styles.editableField}
                            error={Boolean(usernameError)}
                            helperText={usernameError} // Solo usamos esto para el mensaje
                        />
                    ) : (
                        user['Nombre de Usuario']
                    )}
                </td>

                {/* Campo editable: Email */}
                <td onDoubleClick={() => onDoubleClick(user, 'Email')}>
                    {isEditing ? (
                        <TextField
                            variant="outlined"
                            size="small"
                            value={
                                editedFields.Email !== undefined
                                    ? editedFields.Email
                                    : user.Email
                            }
                            onChange={(e) => handleInputChange('Email', e.target.value)}
                            className={styles.editableField}
                            error={Boolean(emailError)}
                            helperText={emailError} // Solo usamos esto para el mensaje
                        />
                    ) : (
                        user.Email
                    )}
                </td>

                {/* Roles */}
                <td>{user.Rol}</td>

                {/* Botón de "Editar roles" */}
                <td>
                    <Tooltip title="Editar roles">
                        <IconButton onClick={handleOpenRolesModal}>
                            <AddCircleOutlineIcon />
                        </IconButton>
                    </Tooltip>
                </td>

                <td>{new Date(user['Fecha de Alta']).toLocaleDateString()}</td>
                <td>{user.Asignó}</td>

                {/* Opciones */}
                <td>
                    {isEditing ? (
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={handleConfirmEdit}
                            className={styles.confirmButton}
                        >
                            Confirmar
                        </Button>
                    ) : (
                        <IconButton
                            onClick={(e) => onMenuOpen(e, user)}
                            aria-label="opciones"
                            style={{ color: !user.Activo ? 'black' : 'inherit' }} // Cambiar el color si está deshabilitado
                        >
                            <MoreVertIcon />
                        </IconButton>
                    )}
                </td>
            </tr>

            {/* Modal de roles */}
            <AssignRolesModal
                isOpen={isRolesModalOpen}
                onClose={handleCloseRolesModal}
                user={user}
                onRolesUpdated={(userId, newRoles) => {
                    onRolesUpdated(userId, newRoles);
                    setIsRolesModalOpen(false);
                }}
            />
        </>
    );
};

export default UserTableRow;
