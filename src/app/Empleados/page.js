'use client'

import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Alert } from '@mui/material';
import theme from '../$tema/theme';
import styles from './page.module.css';
import TablaEmpleados from '../%Components/TablaEmpleados/TablaEmpleados';
import HonorariosTable from '../%Components/TablaEmpleados/TablaHonorarios';
import TablaSeccionNoBar from '../%Components/TablaSeccion/TablaSeccionNoBar';

export default function Empleados() {
    const [showEmpleados, setShowEmpleados] = useState(false);
    const [showHonorarios, setShowHonorarios] = useState(false);


    return (
        <ThemeProvider theme={theme}>
            <main className={styles.main}>
                <Alert severity="info" className={styles.alert} sx={{ margin: '1rem' }}>
                    Presiona doble click en un empleado para ver sus detalles.
                </Alert>
                <TablaSeccionNoBar
                    titulo="Empleados"
                    isOpen={showEmpleados}
                    onToggle={() => setShowEmpleados(!showEmpleados)}
                    tabla={
                        <TablaEmpleados />
                    }
                />
                <TablaSeccionNoBar
                    titulo="Honorarios"
                    isOpen={showHonorarios}
                    onToggle={() => setShowHonorarios(!showHonorarios)}
                    tabla={
                        <HonorariosTable />
                    }
                />

                
            </main>
        </ThemeProvider>
    );
}
