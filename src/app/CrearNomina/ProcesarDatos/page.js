'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';
import { ThemeProvider, Button, Box, Switch, FormControlLabel, Alert } from '@mui/material';
import styles from './page.module.css';
import theme from '../../$tema/theme';
import ChequesResumen from '../../%Components/TablasComparativasNomina/ChequesResumen';
import DepositoResumen from '../../%Components/TablasComparativasNomina/DepositoResumen';
import Totales from '../../%Components/TablasComparativasNomina/Totales';
import PercepcionesTabla from '../../%Components/TablasComparativasNomina/PercepcionesTablas';
import DeduccionesTabla from '../../%Components/TablasComparativasNomina/DeduccionesTabla';
import API_BASE_URL from '../../%Config/apiConfig';
import DateFilter from '../../%Components/DateFilter/DateFilter';
import ProtectedView from '../../%Components/ProtectedView/ProtectedView';
import HeaderSeccion from '../../%Components/HeaderSeccion/HeaderSeccion'; // Importar HeaderSeccion
import AsyncButton from '../../%Components/AsyncButton/AsyncButton';

const CargarDatos = () => {
    const router = useRouter();

    const [anio, setAnio] = useState('2024'); // Valor por defecto
    const [quincena, setQuincena] = useState('01'); // Valor por defecto

    const [chequesData, setChequesData] = useState([]);
    const [depositoData, setDepositoData] = useState([]);
    const [totalesData, setTotalesData] = useState([]);

    const [showDepositos, setShowDepositos] = useState(false);
    const [showCheques, setShowCheques] = useState(false);
    const [showTotales, setShowTotales] = useState(false);
    const [showPercepciones, setShowPercepciones] = useState(false);
    const [showDeducciones, setShowDeducciones] = useState(false);

    const nombreNomina = 'Compuesta';

    // Función que se ejecutará al seleccionar una fecha en el DateFilter
    const handleDateChange = ({ anio, quincena }) => {
        setAnio(anio);
        setQuincena(quincena);
    };

    useEffect(() => {
        if (anio && quincena) {
            fetchChequesData(anio, quincena);
            fetchDepositoData(anio, quincena);
            fetchTotalesData(anio, quincena);
        }
    }, [anio, quincena]);

    const fetchChequesData = async (anio, quincena) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/NominaCtrl/BancosNulos`, {
                params: { anio, quincena, cancelado: false, completado: true },
            });
            setChequesData(response.data);
        } catch (error) {
            console.error('Error fetching cheques data', error);
        }
    };

    const fetchDepositoData = async (anio, quincena) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/NominaCtrl/BancosNoNulos`, {
                params: { anio, quincena, cancelado: false, completado: true },
            });
            setDepositoData(response.data);
        } catch (error) {
            console.error('Error fetching deposito data', error);
        }
    };

    const fetchTotalesData = async (anio, quincena) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/NominaCtrl/Totales`, {
                params: { anio, quincena, cancelado: false, completado: true },
            });
            setTotalesData(response.data);
        } catch (error) {
            console.error('Error fetching totales data', error);
        }
    };

    const exportExcel = () => {
        const workbook = XLSX.utils.book_new();

        const addSheetToWorkbook = (data, sheetName) => {
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        };

        addSheetToWorkbook(chequesData, 'Cheques Resumen');
        addSheetToWorkbook(depositoData, 'Deposito Resumen');
        addSheetToWorkbook(totalesData, 'Totales');

        XLSX.writeFile(workbook, 'resumen.xlsx');
    };

    const exportPDF = async () => {
        const { jsPDF } = await import('jspdf');
        const autoTable = await import('jspdf-autotable');
        const doc = new jsPDF();

        const addDataToPDF = (data, title) => {
            const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 20;
            doc.text(title, 14, startY - 10);
            autoTable.default(doc, {
                startY: startY,
                head: [Object.keys(data[0])],
                body: data.map(item => Object.values(item)),
            });
        };

        addDataToPDF(chequesData, 'Cheques Resumen');
        addDataToPDF(depositoData, 'Deposito Resumen');
        addDataToPDF(totalesData, 'Totales');

        doc.save('resumen.pdf');
    };

    const handleNavigateToAprobacion = () => {
        router.push(`/AprobarCargaNomina?anio=${anio}&quincena=${quincena}`);
    };

    return (
        <ProtectedView requiredPermissions={["Resumen_nomina", "Acceso_total"]}>
            <ThemeProvider theme={theme}>
                <main className={styles.main}>
                    <h1 className={styles.h1}>Resumen de Nómina</h1>

                    <Alert severity="info" className={styles.alert} sx={{ margin: '2rem' }}>
                        Aquí podrás ver los resúmenes de nómina para comprobar que sean correctos.
                    </Alert>

                    <Box className={styles.selectorContainer}>
                        <DateFilter onDateChange={handleDateChange} />
                    </Box>

                    {/* Encabezado y tabla de Depósitos Resumen */}
                    <HeaderSeccion
                        titulo={`Depositos Resumen QNA ${quincena}/${anio}`}
                        onToggle={() => setShowDepositos(!showDepositos)}
                        isOpen={showDepositos}
                    />
                    {showDepositos && (
                        <DepositoResumen resumenData={depositoData} anio={anio} quincena={quincena} />
                    )}

                    {/* Encabezado y tabla de Cheques Resumen */}
                    <HeaderSeccion
                        titulo={`Cheques Resumen QNA ${quincena}/${anio}`}
                        onToggle={() => setShowCheques(!showCheques)}
                        isOpen={showCheques}
                    />
                    {showCheques && (
                        <ChequesResumen resumenData={chequesData} anio={anio} quincena={quincena} />
                    )}

                    {/* Encabezado y tabla de Totales */}
                    <HeaderSeccion
                        titulo={`Totales QNA ${quincena}/${anio}`}
                        onToggle={() => setShowTotales(!showTotales)}
                        isOpen={showTotales}
                    />
                    {showTotales && (
                        <Totales resumenData={totalesData} anio={anio} quincena={quincena} />
                    )}

                    {/* Encabezado y tabla de Percepciones */}
                    <HeaderSeccion
                        titulo={`Percepciones QNA ${quincena}/${anio}`}
                        onToggle={() => setShowPercepciones(!showPercepciones)}
                        isOpen={showPercepciones}
                    />
                    {showPercepciones && (
                        <PercepcionesTabla anio={anio} quincena={quincena} nombreNomina={nombreNomina} />
                    )}

                    {/* Encabezado y tabla de Deducciones */}
                    <HeaderSeccion
                        titulo={`Deducciones QNA ${quincena}/${anio}`}
                        onToggle={() => setShowDeducciones(!showDeducciones)}
                        isOpen={showDeducciones}
                    />
                    {showDeducciones && (
                        <DeduccionesTabla anio={anio} quincena={quincena} nombreNomina={nombreNomina} />
                    )}

                    <Box className={styles.buttonContainer}>
                        <AsyncButton
                            variant="contained"
                            color="secondary"
                            onClick={() => router.back()}
                            className={styles.backButton}
                        >
                            Regresar
                        </AsyncButton>
                        <AsyncButton className={styles.botonesExportar}
                            variant="contained"
                            color="primary"
                            onClick={handleNavigateToAprobacion}
                        >
                            Ir a Aprobación de Nóminas
                        </AsyncButton>
                    </Box>
                </main>
            </ThemeProvider>
        </ProtectedView>
    );
};

export default CargarDatos;
