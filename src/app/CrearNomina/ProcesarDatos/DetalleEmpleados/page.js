'use client';

import React, { useState, useEffect } from 'react';
import { Button, Alert, Box } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from './page.module.css';
import API_BASE_URL from '../../../%Config/apiConfig';
import { useRouter } from 'next/navigation';

export default function DetalleEmpleados() {
    const router = useRouter();

    const searchParams = useSearchParams();
    const anio = searchParams.get('anio');
    const quincena = searchParams.get('quincena');
    const nomina = searchParams.get('nomina');
    const banco = searchParams.get('banco');

    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmpleados = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/consultaEmpleados/especifico`, {
                    params: {
                        anio,
                        quincena,
                        nomina,
                        banco,
                    },
                });
                setEmpleados(response.data);
            } catch (error) {
                console.error('Error fetching empleados data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (anio && quincena && nomina && banco) {
            fetchEmpleados();
        }
    }, [anio, quincena, nomina, banco]);

    // Función para exportar a PDF
    const exportPDF = () => {
        const doc = new jsPDF();
        const tableData = empleados.map((row) => [
            row.ANIO,
            row.QUINCENA,
            row.NOMINA,
            row.BANCO,
            row.ID_EMPLEADO,
            row.NOMBRE,
            row.APELLIDO_1,
            row.APELLIDO_2,
            row.PERCEPCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            row.DEDUCCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            row.LIQUIDO.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        ]);

        autoTable(doc, {
            head: [['AÑO', 'QUINCENA', 'NÓMINA', 'BANCO', 'ID EMPLEADO', 'NOMBRE', 'APELLIDO PATERNO', 'APELLIDO MATERNO', 'PERCEPCIONES', 'DEDUCCIONES', 'LÍQUIDO']],
            body: tableData,
        });

        doc.save(`Detalle_Empleados_QNA_${quincena}_${anio}.pdf`);
    };

    // Función para exportar a Excel
    const exportExcel = () => {
        const worksheetData = empleados.map((row) => ({
            AÑO: row.ANIO,
            QUINCENA: row.QUINCENA,
            NÓMINA: row.NOMINA,
            BANCO: row.BANCO,
            ID_EMPLEADO: row.ID_EMPLEADO,
            NOMBRE: row.NOMBRE,
            'APELLIDO PATERNO': row.APELLIDO_1,
            'APELLIDO MATERNO': row.APELLIDO_2,
            PERCEPCIONES: row.PERCEPCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            DEDUCCIONES: row.DEDUCCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            LÍQUIDO: row.LIQUIDO.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `Detalle_Empleados_QNA_${quincena}_${anio}.xlsx`);
    };

    // Función para exportar a CSV
    const exportCSV = () => {
        const csvContent = [
            ['AÑO', 'QUINCENA', 'NÓMINA', 'BANCO', 'ID EMPLEADO', 'NOMBRE', 'APELLIDO PATERNO', 'APELLIDO MATERNO', 'PERCEPCIONES', 'DEDUCCIONES', 'LÍQUIDO'].join(','),
            ...empleados.map((row) =>
                [
                    row.ANIO,
                    row.QUINCENA,
                    row.NOMINA,
                    row.BANCO,
                    row.ID_EMPLEADO,
                    row.NOMBRE,
                    row.APELLIDO_1,
                    row.APELLIDO_2,
                    row.PERCEPCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                    row.DEDUCCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                    row.LIQUIDO.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `Detalle_Empleados_QNA_${quincena}_${anio}.csv`);
    };

    return (
        <main className={styles.main}>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className={`card ${styles.card}`}>
                    <Alert severity="info" className={styles.alert} sx={{ margin: '2rem' }}>
                        Aquí puedes ver a detalle el resúmen de nómina desglosado por empleados
                    </Alert>
                    <h2 className={styles.header}>DETALLE DE EMPLEADOS (QNA {quincena}/{anio})</h2>
                    <DataTable value={empleados} paginator rows={10} className="p-datatable-sm">
                        <Column field="ANIO" header="AÑO" sortable></Column>
                        <Column field="QUINCENA" header="QUINCENA" sortable></Column>
                        <Column field="NOMINA" header="NÓMINA" sortable></Column>
                        <Column field="BANCO" header="BANCO" sortable></Column>
                        <Column field="ID_EMPLEADO" header="ID EMPLEADO" sortable></Column>
                        <Column field="NOMBRE" header="NOMBRE" sortable></Column>
                        <Column field="APELLIDO_1" header="APELLIDO PATERNO" sortable></Column>
                        <Column field="APELLIDO_2" header="APELLIDO MATERNO" sortable></Column>
                        <Column field="PERCEPCIONES" header="PERCEPCIONES" sortable body={(rowData) => rowData.PERCEPCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}></Column>
                        <Column field="DEDUCCIONES" header="DEDUCCIONES" sortable body={(rowData) => rowData.DEDUCCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}></Column>
                        <Column field="LIQUIDO" header="LÍQUIDO" sortable body={(rowData) => rowData.LIQUIDO.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}></Column>
                    </DataTable>

                    {/* Botones de Exportación */}
                    <Box display="flex" justifyContent="space-between" marginTop="20px">
                        <Button variant="outlined" color="primary" onClick={exportPDF}>
                            Exportar PDF
                        </Button>
                        <Button variant="outlined" color="primary" onClick={exportExcel}>
                            Exportar Excel
                        </Button>
                        <Button variant="outlined" color="primary" onClick={exportCSV}>
                            Exportar CSV
                        </Button>
                    </Box>
                </div>
            )}

            <Button
                variant="contained"
                color="secondary"
                onClick={() => router.back()} // Regresa a la página anterior
                className={styles.backButton}
            >
                Regresar
            </Button>
        </main>
    );
}
