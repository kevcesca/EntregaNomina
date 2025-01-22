import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { API_USERS_URL } from '../../%Config/apiConfig';

const ChangePasswordModal = ({ isOpen, onClose, userId, onPasswordChanged }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [matchError, setMatchError] = useState('');
    const [loading, setLoading] = useState(false);

    // Validar seguridad de la contraseña
    const validarSeguridadContraseña = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        return regex.test(password);
    };

    // Manejar cambio en el campo de nueva contraseña
    const handleNewPasswordChange = (value) => {
        setNewPassword(value);

        if (!validarSeguridadContraseña(value)) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres, incluir letras mayúsculas, minúsculas, números y símbolos.');
        } else {
            setPasswordError('');
        }

        // Validar coincidencia si ya hay un valor en confirmar contraseña
        if (confirmPassword && value !== confirmPassword) {
            setMatchError('Las contraseñas no coinciden.');
        } else {
            setMatchError('');
        }
    };

    // Manejar cambio en el campo de confirmar contraseña
    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);

        if (newPassword && value !== newPassword) {
            setMatchError('Las contraseñas no coinciden.');
        } else {
            setMatchError('');
        }
    };

    // Manejar el cambio de contraseña al presionar el botón
    const handleChangePassword = async () => {
        if (passwordError || matchError || !newPassword || !confirmPassword) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_USERS_URL}/users/${userId}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newPassword,
                    confirmPassword,
                }),
            });

            if (!response.ok) {
                throw new Error('Error al cambiar la contraseña');
            }

            onPasswordChanged();
            onClose(); // Cerrar el modal al completar
        } catch (error) {
            setPasswordError('Hubo un problema al cambiar la contraseña. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogContent>
                <TextField
                    label="Nueva Contraseña"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    margin="normal"
                    error={!!passwordError}
                    helperText={passwordError}
                    InputProps={{
                        endAdornment: (
                            <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        ),
                    }}
                />
                <TextField
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    margin="normal"
                    error={!!matchError}
                    helperText={matchError}
                    InputProps={{
                        endAdornment: (
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        ),
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button
                    onClick={handleChangePassword}
                    color="primary"
                    disabled={
                        loading ||
                        !!passwordError || // Deshabilitar si hay error en la contraseña
                        !!matchError || // Deshabilitar si hay error de coincidencia
                        !newPassword || // Deshabilitar si no hay nueva contraseña
                        !confirmPassword // Deshabilitar si no hay confirmación de contraseña
                    }
                >
                    {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChangePasswordModal;
