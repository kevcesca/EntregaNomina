'use client';

import React, { useState, useRef } from 'react';
import { Toast } from 'primereact/toast';
import styles from './page.module.css';
import TablaEstadosCuenta from '../%Components/TablaEstadosCuenta/TablaEstadosCuenta';
import TablaRetenciones from '../%Components/TablaRetenciones/TablaRetenciones';
import DateFilter from '../%Components/DateFilter/DateFilter';
import { ProgressBar } from 'primereact/progressbar';
import { ThemeProvider, Box, Typography } from '@mui/material';
import theme from '../$tema/theme';
import HeaderSeccion from '../%Components/HeaderSeccion/HeaderSeccion';
import { useAuth } from '../context/AuthContext'

function CargarEstadosCuenta() {
    const { user: currentUser } = useAuth();
    const [mes, setMes] = useState('');
    const [anio, setAnio] = useState('');
    const [quincena, setQuincena] = useState('');
    const [progressEstadosCuenta, setProgressEstadosCuenta] = useState(0);
    const [progressRetenciones, setProgressRetenciones] = useState(0);
    const [isEstadosCuentaOpen, setIsEstadosCuentaOpen] = useState(false);
    const [isDispersionesOpen, setIsDispersionesOpen] = useState(false);

    const toast = useRef(null);

    // Función auxiliar para convertir quincena a mes
    const quincenaAMes = (quincena) => {
        return Math.ceil(quincena / 2).toString().padStart(2, '0');
    };

    // Callback para manejar el cambio de fecha desde DateFilter
    const handleDateChange = ({ anio, quincena }) => {
        setAnio(anio);
        setQuincena(quincena);

        // Calcular y actualizar el mes basado en la quincena
        const mesCalculado = quincenaAMes(parseInt(quincena));
        setMes(mesCalculado);

        // Mostrar un mensaje de actualización
        toast.current.show({
            severity: 'info',
            summary: 'Fecha Actualizada',
            detail: `Año: ${anio}, Quincena: ${quincena}, Mes: ${mesCalculado}`,
            life: 2000,
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <Toast ref={toast} />
            <Box className={styles.main}>
                <Typography variant="h4" className={styles.h1}>
                    Carga de Estados de Cuenta y Retenciones
                </Typography>

                <DateFilter onDateChange={handleDateChange} />

                <HeaderSeccion
                    titulo="Estados de Cuenta"
                    isOpen={isEstadosCuentaOpen}
                    onToggle={() => setIsEstadosCuentaOpen(!isEstadosCuentaOpen)}
                />
                {isEstadosCuentaOpen && (
                    <TablaEstadosCuenta
                        anio={anio}
                        mes={mes}
                        quincena={quincena}
                        setProgress={setProgressEstadosCuenta}
                        setUploaded={() => {}}
                        session={currentUser.nombre_usuario}
                    />
                )}

                <HeaderSeccion
                    titulo="Dispersiones"
                    isOpen={isDispersionesOpen}
                    onToggle={() => setIsDispersionesOpen(!isDispersionesOpen)}
                />
                {isDispersionesOpen && (
                    <>
                        <TablaRetenciones
                            anio={anio}
                            mes={mes}
                            quincena={quincena}
                            setProgress={setProgressRetenciones}
                            setUploaded={() => {}}
                            session={currentUser.nombre_usuario}
                        />
                    </>
                )}
            </Box>
        </ThemeProvider>
    );
}

export default CargarEstadosCuenta;

