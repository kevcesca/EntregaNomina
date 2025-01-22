"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Button, TextField, Container, Typography, Box, IconButton, InputAdornment, ThemeProvider } from '@mui/material';
import styles from './Login.module.css';
import theme from '../../$tema/theme';
import { API_USERS_URL } from '../../%Config/apiConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { setUser, checkPasswordForEmployee } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Por favor, complete todos los campos');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_USERS_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    correo_usuario: email,
                    contrasena_usuario: password,
                }),
                credentials: 'include',
            });

            // Manejar errores de autenticación genéricamente
            if (!response.ok) {
                setError('Usuario y/o contraseña inválido'); // Mensaje genérico
                return;
            }

            const data = await response.json();
            setUser(data.user);

            const idEmpleado = data.user.id_empleado;
            const isPasswordCorrect = await checkPasswordForEmployee(idEmpleado);

            // Validar si la contraseña necesita ser cambiada
            if (isPasswordCorrect) {
                router.push('/NuevaContrasena');
            } else {
                setError('Usuario y/o contraseña inválido'); // Mensaje genérico
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Ocurrió un error inesperado. Por favor, intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs" className={styles.tWhite}>
                <Box
                    sx={{
                        marginTop: 4,
                        marginBottom: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Image src="/logo.png" alt="Logotipo Alcaldía Azcapotzalco" width={1000} height={500} className={styles.image} />
                    <Box
                        className={styles.card}
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <AccountCircleIcon sx={{ fontSize: 100, color: '#711c31' }} />
                        <Typography component="h1" variant="h5" className={styles.tWhite}>
                            Bienvenido
                        </Typography>
                        <Box component="form" noValidate sx={{ mt: 1 }} onSubmit={handleLogin}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Correo electrónico"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Correo electrónico"
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Contraseña"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={toggleShowPassword} edge="end">
                                                {showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            {error && (
                                <Typography color="error" align="center" sx={{ mt: 2 }}>
                                    {error}
                                </Typography>
                            )}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Iniciando...' : 'Iniciar'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Login;
