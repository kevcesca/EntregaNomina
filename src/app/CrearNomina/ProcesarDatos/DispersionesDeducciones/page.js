'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import PercepcionesTabla from '../../../%Components/TablasComparativasNomina/PercepcionesTablas';
import DeduccionesTabla from '../../../%Components/TablasComparativasNomina/DeduccionesTabla';
import { Box, Typography } from '@mui/material';
import styles from './page.module.css';

export default function DispersionesDeducciones() {
    const searchParams = useSearchParams();
    const anio = searchParams.get('anio');
    const quincena = searchParams.get('quincena');
    const nomina = searchParams.get('nomina') || 'Compuesta'; // 'nomina' se pasa como parámetro
    const subTipo = searchParams.get('subTipo') || ''; // Obtenemos el 'subTipo' de los parámetros

    return (
        <main className={styles.main}>
            <Typography variant="h4">Dispersiones y Deducciones</Typography>
            <Box mt={4}>
                <Typography variant="h6">Percepciones para {nomina}</Typography>
                <PercepcionesTabla anio={anio} quincena={quincena} nombreNomina={nomina} subTipo={subTipo} />
            </Box>
            <Box mt={4}>
                <Typography variant="h6">Deducciones para {nomina}</Typography>
                <DeduccionesTabla anio={anio} quincena={quincena} nombreNomina={nomina} subTipo={subTipo} />
            </Box>
        </main>
    );
}
