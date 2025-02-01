'use client';

import React, { useState } from 'react';
import { ThemeProvider, Box, Button, Alert } from '@mui/material';
import styles from './page.module.css';
import theme from '../$tema/theme';
import DateFilter from '../%Components/DateFilter/DateFilter'; // Importa tu componente DateFilter
import ComparativaTable from '../%Components/ComparativeTable/ComparativeTable';
import ComparativaTable2 from '../%Components/ComparativeTable/ComparativeTable2';
import HeaderSeccion from '../%Components/HeaderSeccion/HeaderSeccion'; // Importa el HeaderSeccion
import { useRouter } from 'next/navigation';
import ProtectedView from '../%Components/ProtectedView/ProtectedView'; // Importa el componente
import AsyncButton from '../%Components/AsyncButton/AsyncButton';

const AprobarCargaNomina = () => {
    const router = useRouter();

    // Estados para el año, quincena y visibilidad de tablas
    const [anio, setAnio] = useState('2024');
    const [quincena, setQuincena] = useState('01');
    const [showTabla1, setShowTabla1] = useState(false); // Controla visibilidad de tabla 1
    const [showTabla2, setShowTabla2] = useState(false); // Controla visibilidad de tabla 2

    // Función para manejar los cambios de fecha desde el DateFilter
    const handleDateChange = ({ anio: nuevoAnio, quincena: nuevaQuincena }) => {
        setAnio(nuevoAnio);
        setQuincena(nuevaQuincena);
    };

    return (
        <ProtectedView requiredPermissions={["Carga_de_Nomina", "Acceso_total"]}>
            <ThemeProvider theme={theme}>
                <main className={styles.main}>
                    <h1 className={styles.h1}>
                        Aprobación de Nóminas {quincena} {anio}
                    </h1>
                
                    {/* Contenedor del filtro de fecha */}
                    <Box className={styles.selectorContainer}>
                        <DateFilter onDateChange={handleDateChange} />
                    </Box>

                    <Alert severity="info" className={styles.alert} sx={{ margin: '1rem' }}>
                        Estás viendo únicamente los archivos que requieren aprobación. La aprobación se completará cuando se haya hecho la doble validación.
                    </Alert>

                    {/* Tabla 1: Encabezado y tabla plegable */}
                    <ProtectedView requiredPermissions={["ver_aprobacion_1", "Acceso_total"]}>
                        <Box mt={4}>
                            <HeaderSeccion
                                titulo={`Aprobación 1 - Quincena ${quincena}/${anio}`}
                                isOpen={showTabla1}
                                onToggle={() => setShowTabla1(!showTabla1)} // Alterna la visibilidad
                            />
                            {showTabla1 && (
                                <Box>
                                    <ComparativaTable quincena={quincena} anio={anio} />
                                </Box>
                            )}
                        </Box>
                    </ProtectedView>

                    {/* Tabla 2: Encabezado y tabla plegable */}
                    <ProtectedView requiredPermissions={["ver_aprobacion_2", "Acceso_total"]}>
                        <Box mt={4}>
                            <HeaderSeccion
                                titulo={`Aprobación 2 - Quincena ${quincena}/${anio}`}
                                isOpen={showTabla2}
                                onToggle={() => setShowTabla2(!showTabla2)} // Alterna la visibilidad
                            />
                            {showTabla2 && (
                                <Box>
                                    <ComparativaTable2 quincena={quincena} anio={anio} />
                                </Box>
                            )}
                        </Box>
                    </ProtectedView>
<br></br>
                    {/* Botón para regresar a la página anterior */}
                    <Box className={styles.buttonContainer}>
                        <AsyncButton
                            variant="contained"
                            color="secondary"
                            onClick={() => router.back()} // Regresa a la página anterior
                            className={styles.backButton}
                        >
                            Regresar
                        </AsyncButton>
                    </Box>
                </main>
            </ThemeProvider>
        </ProtectedView>
    );
};

export default AprobarCargaNomina;
