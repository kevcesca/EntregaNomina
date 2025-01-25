'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TextField, IconButton, Button } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation'; // Para redirección
import styles from '../NuevaContrasena/NuevaContrasena.module.css'; 
import { API_USERS_URL } from '../%Config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { Toast } from 'primereact/toast';

export default function RecuperarContraseña() {
  const { user, logout, checkPasswordForEmployee } = useAuth();
  const router = useRouter(); // Instancia de router
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [matchError, setMatchError] = useState('');
  const [serverError, setServerError] = useState('');
  const idEmpleado = user?.id_empleado;
  const toast = useRef(null);

  // Verificación al montar el componente
  useEffect(() => {
    const verifyPassword = async () => {
      if (!idEmpleado) {
        setServerError('No se ha encontrado el ID del empleado en la sesión.');
        router.push('/'); // Redirige al inicio si no hay ID
        return;
      }

      const isDefaultPassword = await checkPasswordForEmployee(idEmpleado);
      if (!isDefaultPassword) {
        router.push('/'); // Redirige al inicio si no es la contraseña por defecto
      }
    };

    verifyPassword(); // Ejecuta la verificación al cargar
  }, [idEmpleado, checkPasswordForEmployee, router]);

  const validarSeguridadContraseña = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  const changePassword = async () => {
    setPasswordError('');
    setMatchError('');
    setServerError('');

    if (!validarSeguridadContraseña(newPassword)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres, incluir letras mayúsculas, minúsculas, números y símbolos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMatchError('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
      return;
    }

    if (!idEmpleado) {
      setServerError('El ID del empleado es obligatorio.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_USERS_URL}/users/${idEmpleado}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setServerError(errorData.message || 'Error al cambiar la contraseña.');
        return;
      }
      toast.current.show({ severity: 'success', summary: 'Successful', detail: `La contraseña ha sido cambiada con éxito para el empleado con ID: ${idEmpleado}`, life: 3000 });
      setTimeout(() => {
        logout(); // Cerrar la sesión después de cambiar la contraseña
      }, 2000);
    } catch (err) {
      setServerError('Ocurrió un error al intentar cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.body}>
      <Toast ref={toast} />
      <div className={styles.container}>
        <h1>Cambiar Contraseña</h1>
        <div className={styles.section}>
          <h2 className={styles.h2}>Cambia tu contraseña por una más segura</h2>

          <TextField
            fullWidth
            label="Nueva Contraseña"
            type={showNewPassword ? 'text' : 'password'}
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            required
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
            fullWidth
            label="Confirmar Contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
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

          <Button
            variant="contained"
            color="primary"
            onClick={changePassword}
            disabled={loading || !newPassword || !confirmPassword}
            fullWidth
            style={{ marginTop: '16px' }}
          >
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>

          {serverError && <p className={styles.error}>{serverError}</p>}
        </div>
      </div>
    </div>
  );
}
