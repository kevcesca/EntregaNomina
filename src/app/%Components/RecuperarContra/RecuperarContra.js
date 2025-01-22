'use client';
import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box, ThemeProvider } from '@mui/material';
import { useRouter } from 'next/navigation';
import styles from './RecuperarContra.module.css';
import theme from '../../$tema/theme';

const RecuperarContra = () => {
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const router = useRouter();

    const handleSubmit = (event) => {
        event.preventDefault();
        // Lógica de recuperación de contraseña
        if (email !== confirmEmail) {
            alert('Los correos electrónicos no coinciden');
            return;
        }
        console.log(`Recuperar contraseña para: ${email}`);
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs" className={styles.main}>
                <Box
                    className={styles.card}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h4">
                        Recuperar Contraseña
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, marginTop: '40px' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Correo Electrónico"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="confirmEmail"
                            label="Confirma Correo Electrónico"
                            name="confirmEmail"
                            autoComplete="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Recuperar
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            color="secondary"
                            sx={{ mt: 1, mb: 2 }}
                            onClick={() => router.push('/login')}
                        >
                            Regresar
                        </Button>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default RecuperarContra;
