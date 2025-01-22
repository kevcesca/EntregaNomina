'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider, Box, Typography, Alert, Button } from '@mui/material';
import Link from 'next/link';
import ProtectedView from '../%Components/ProtectedView/ProtectedView';
import DateFilter from '../%Components/DateFilter/DateFilter';
import TablaSeccion from '../%Components/TablaSeccion/TablaSeccion';
import TablaPostNomina from '../%Components/TablaPostNomina/TablaPostNomina';
import TablaPostNominaHonorarios from '../%Components/TablaPostNomina/TablaPostNominaHonorarios';
import TablaQuincenasExtraordinarias from '../%Components/TablaPostNomina/TablaQuincenasExtraordinarias';
import TablaFiniquitos from '../%Components/TablaPostNomina/TablaFiniquitos';
import theme from '../$tema/theme';
import styles from './page.module.css';
import AsyncButton from '../%Components/AsyncButton/AsyncButton';
import { useAuth } from '../context/AuthContext'

export default function CargarDatos() {
    const { user: currentUser } = useAuth(); // Recuperamos el usuario actual del contexto
    const [quincena, setQuincena] = useState(null);
    const [anio, setAnio] = useState(null);
    const [progressPostNomina, setProgressPostNomina] = useState(0);
    const [progressHonorarios, setProgressHonorarios] = useState(0);
    const [showNominaCompuesta, setShowNominaCompuesta] = useState(false);
    const [showNominaHonorarios, setShowNominaHonorarios] = useState(false);
    const [showExtraordinarias, setShowExtraordinarias] = useState(false);
    const [showFiniquitos, setShowFiniquitos] = useState(false);
    const [postNominaUploaded, setPostNominaUploaded] = useState(false);
    const [honorariosUploaded, setHonorariosUploaded] = useState(false);


    const toast = useRef(null);

    // Efecto para validar que anio y quincena no sean null antes de pasar a las tablas
    useEffect(() => {
        if (anio && quincena) {
            // Aquí podemos hacer un log o alguna otra acción si es necesario
        }
    }, [anio, quincena]);

    // Asegurándonos de que los valores son válidos
    const isValid = (value) => {
        return value !== null && value !== undefined;
    };

    return (
        <ProtectedView requiredPermissions={["Carga_de_Nomina", "Acceso_total"]}>
            <ThemeProvider theme={theme}>
                <Box className={styles.main}>
                    <Typography variant="h4" className={styles.h1}>
                        Carga de Nómina
                    </Typography>

                    {/* Filtro de fecha */}
                    <DateFilter
                        onDateChange={({ anio: nuevoAnio, quincena: nuevaQuincena }) => {
                            setAnio(nuevoAnio);
                            setQuincena(nuevaQuincena);
                        }}
                    />

                    <div className={styles.sectionContainer}>
                        <Alert severity="info" className={styles.alert} sx={{ margin: '1rem' }}>
                            En esta ventana podrás subir los archivos de nómina.
                        </Alert>

                        {/* Tabla Nómina Compuesta */}
                        {isValid(anio) && isValid(quincena) && (
                            <TablaSeccion
                                titulo="Nómina Compuesta"
                                isOpen={showNominaCompuesta}
                                onToggle={() => setShowNominaCompuesta(!showNominaCompuesta)}
                                progress={progressPostNomina}
                                tabla={
                                    <TablaPostNomina
                                        quincena={quincena}
                                        anio={anio}
                                        session={currentUser.nombre_usuario} // Pasamos la información del usuario actual
                                        setProgress={setProgressPostNomina}
                                        setUploaded={setPostNominaUploaded}
                                        extra=""
                                    />
                                }
                            />
                        )}

                        {/* Tabla Nómina Honorarios */}
                        {isValid(anio) && isValid(quincena) && (
                            <TablaSeccion
                                titulo="Nómina Honorarios"
                                isOpen={showNominaHonorarios}
                                onToggle={() => setShowNominaHonorarios(!showNominaHonorarios)}
                                progress={progressHonorarios}
                                tabla={
                                    <TablaPostNominaHonorarios
                                        quincena={quincena}
                                        anio={anio}
                                        session={currentUser.nombre_usuario}
                                        setProgress={setProgressHonorarios}
                                        setUploaded={setHonorariosUploaded}
                                    />
                                }
                            />
                        )}

                        {/* Tabla Quincenas Extraordinarias */}
                        {isValid(anio) && isValid(quincena) && (
                            <TablaSeccion
                                titulo="Quincenas Extraordinarias"
                                isOpen={showExtraordinarias}
                                onToggle={() => setShowExtraordinarias(!showExtraordinarias)}
                                progress={0}
                                tabla={
                                    <TablaQuincenasExtraordinarias
                                        quincena={quincena}
                                        anio={anio}
                                        session={currentUser.nombre_usuario}
                                        setProgress={setProgressPostNomina}
                                        setUploaded={setPostNominaUploaded}
                                    />
                                }
                            />
                        )}

                        {/* Tabla Finiquitos */}
                        {isValid(anio) && isValid(quincena) && (
                            <TablaSeccion
                                titulo="Finiquitos"
                                isOpen={showFiniquitos}
                                onToggle={() => setShowFiniquitos(!showFiniquitos)}
                                progress={0}
                                tabla={
                                    <TablaFiniquitos
                                        quincena={quincena}
                                        anio={anio}
                                        session={currentUser.nombre_usuario}
                                        setProgress={setProgressPostNomina}
                                        setUploaded={setPostNominaUploaded}
                                        extra=""
                                    />
                                }
                            />
                        )}

                        {/* Botón para comprobar cambios */}
                        <Box className={styles.buttonContainer}>

                            <Link href={`/Validacion?anio=${anio}&quincena=${quincena}`} passHref>
                                <AsyncButton
                                    variant="contained"
                                    color="secondary"
                                    onClick={async () => {
                                        try {
                                            await new Promise((resolve) => setTimeout(resolve, 1000));
                                            router.push('{`/Validacion?anio=${anio}&quincena=${quincena}`} passHref'); // Navega al enlace especificado
                                        } catch (error) {
                                            console.error('Error al regresar:', error);
                                        }
                                    }}
                                    className={styles.backButton}
                                >
                                    Comprobar Cambios
                                </AsyncButton>
                            </Link>
                        </Box>
                    </div>
                </Box>
            </ThemeProvider>
        </ProtectedView>
    );
}
