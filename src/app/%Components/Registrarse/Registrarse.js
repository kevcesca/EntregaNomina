'use client';
import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box, RadioGroup, FormControlLabel, Radio, FormControl, InputLabel, Select, MenuItem, Grid, ThemeProvider } from '@mui/material';
import theme from '../../$tema/theme';
import styles from './Registrarse.module.css'

const Registrarse = () => {
    const [idEmpleado, setIdEmpleado] = useState('');
    const [activo, setActivo] = useState('');
    const [fechaAlta, setFechaAlta] = useState('');
    const [cargo, setCargo] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido1, setApellido1] = useState('');
    const [apellido2, setApellido2] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        // Lógica de registro de usuario
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        if (email !== confirmEmail) {
            alert('Los correos electrónicos no coinciden');
            return;
        }
        console.log(`Registrar usuario con email: ${email}`);
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="md" className={styles.main}>
                <Box
                    className={styles.card}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h4" >
                        Registrarse
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }} >
                        <Grid container spacing={2} sx={{marginTop: '10px'}}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="idEmpleado"
                                    label="ID Empleado"
                                    name="idEmpleado"
                                    autoFocus
                                    value={idEmpleado}
                                    onChange={(e) => setIdEmpleado(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl component="fieldset" margin="normal" fullWidth sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Typography component="legend">Activo</Typography>
                                    <RadioGroup
                                        row
                                        aria-label="activo"
                                        name="activo"
                                        value={activo}
                                        onChange={(e) => setActivo(e.target.value)}
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <FormControlLabel value="si" control={<Radio />} label="Sí" />
                                        <FormControlLabel value="no" control={<Radio />} label="No" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="fechaAlta"
                                    label="Fecha Alta"
                                    name="fechaAlta"
                                    type="date"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    value={fechaAlta}
                                    onChange={(e) => setFechaAlta(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="cargo-label">Cargo</InputLabel>
                                    <Select
                                        labelId="cargo-label"
                                        id="cargo"
                                        value={cargo}
                                        label="Cargo"
                                        onChange={(e) => setCargo(e.target.value)}
                                    >
                                        <MenuItem value="">
                                            <em>None</em>
                                        </MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                        <MenuItem value="user">User</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="nombre"
                                    label="Nombre(s)"
                                    name="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="apellido1"
                                    label="Apellido Paterno"
                                    name="apellido1"
                                    value={apellido1}
                                    onChange={(e) => setApellido1(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="apellido2"
                                    label="Apellido Materno"
                                    name="apellido2"
                                    value={apellido2}
                                    onChange={(e) => setApellido2(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email"
                                    name="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="confirmEmail"
                                    label="Confirma Email"
                                    name="confirmEmail"
                                    autoComplete="email"
                                    value={confirmEmail}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Contraseña"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirma Contraseña"
                                    type="password"
                                    id="confirmPassword"
                                    autoComplete="current-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => window.location.href = '/'}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                Confirmar
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Registrarse;
