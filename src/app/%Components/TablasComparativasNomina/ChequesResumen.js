'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Button, Box } from '@mui/material';
import styles from './Tablas.module.css';

export default function ChequesResumen({ resumenData, anio, quincena }) {
    const router = useRouter();

    // Limpieza de los datos
    const limpiarDatos = (data) => {
        return data.map(item => ({
            ANIO: item.ANIO.trim(),
            QUINCENA: item.QUINCENA.trim(),
            NOMINA: item.nomina.trim(),
            BANCO: item.banco.trim(),
            PERCEPCIONES: parseFloat(item.PERCEPCIONES.trim().replace(/,/g, '')),
            DEDUCCIONES: parseFloat(item.DEDUCCIONES.trim().replace(/,/g, '')),
            LIQUIDO: parseFloat(item.LIQUIDO.trim().replace(/,/g, '')),
            EMPLEADOS: parseInt(item.empleados.trim(), 10)
        }));
    };

    const chequesData = limpiarDatos(resumenData);
    const datosNormales = chequesData.filter(item => item.BANCO !== 'Total');
    const datosTotales = chequesData.filter(item => item.BANCO === 'Total');

    const handleEmpleadosClick = (rowData) => {
        const { ANIO, QUINCENA, NOMINA, BANCO } = rowData;
        router.push(`/CrearNomina/ProcesarDatos/DetalleEmpleados?anio=${ANIO}&quincena=${QUINCENA}&nomina=${NOMINA}&banco=${BANCO}`);
    };

    const tipoNominaTemplate = (rowData) => {
        return <span className={styles.boldText}>{rowData.NOMINA}</span>;
    };

    const currencyTemplate = (rowData, field) => {
        return rowData[field].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const empleadosTemplate = (rowData) => {
        return (
            <span
                className={styles.empleadosLink}
                onClick={() => handleEmpleadosClick(rowData)}
            >
                {rowData.EMPLEADOS}
            </span>
        );
    };

    // Combina todos los datos (normales y totales) para exportación
    const allDataForExport = [...datosNormales, ...datosTotales];

    // Función para exportar a PDF
    const exportPDF = () => {
        const doc = new jsPDF();
        const tableData = allDataForExport.map((row) => [
            row.ANIO,
            row.QUINCENA,
            row.NOMINA,
            row.BANCO,
            row.PERCEPCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            row.DEDUCCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            row.LIQUIDO.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            row.EMPLEADOS,
        ]);

        autoTable(doc, {
            head: [['AÑO', 'QUINCENA', 'NÓMINA', 'BANCO', 'PERCEPCIONES', 'DEDUCCIONES', 'LÍQUIDO', 'EMPLEADOS']],
            body: tableData,
        });

        doc.save(`Cheques_Resumen_QNA_${quincena}_${anio}.pdf`);
    };

    // Función para exportar a Excel
    const exportExcel = () => {
        const worksheetData = allDataForExport.map((row) => ({
            AÑO: row.ANIO,
            QUINCENA: row.QUINCENA,
            NÓMINA: row.NOMINA,
            BANCO: row.BANCO,
            PERCEPCIONES: row.PERCEPCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            DEDUCCIONES: row.DEDUCCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            LÍQUIDO: row.LIQUIDO.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            EMPLEADOS: row.EMPLEADOS,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `Cheques_Resumen_QNA_${quincena}_${anio}.xlsx`);
    };

    // Función para exportar a CSV
    const exportCSV = () => {
        const csvContent = [
            ['AÑO', 'QUINCENA', 'NÓMINA', 'BANCO', 'PERCEPCIONES', 'DEDUCCIONES', 'LÍQUIDO', 'EMPLEADOS'].join(','),
            ...allDataForExport.map((row) =>
                [
                    row.ANIO,
                    row.QUINCENA,
                    row.NOMINA,
                    row.BANCO,
                    row.PERCEPCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                    row.DEDUCCIONES.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                    row.LIQUIDO.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                    row.EMPLEADOS,
                ].join(',')
            ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `Cheques_Resumen_QNA_${quincena}_${anio}.csv`);
    };

    return (
        <div className={`card ${styles.card}`}>
            {/* Tabla de datos normales */}
            <DataTable
                value={datosNormales}
                paginator={false}
                rows={10}
                className="p-datatable-sm"
            >
                <Column field="ANIO" header="AÑO" sortable></Column>
                <Column field="QUINCENA" header="QUINCENA" sortable></Column>
                <Column field="NOMINA" header="NOMINA" sortable body={tipoNominaTemplate}></Column>
                <Column field="BANCO" header="BANCO" sortable></Column>
                <Column field="PERCEPCIONES" header="PERCEPCIONES" sortable body={(rowData) => currencyTemplate(rowData, 'PERCEPCIONES')}></Column>
                <Column field="DEDUCCIONES" header="DEDUCCIONES" sortable body={(rowData) => currencyTemplate(rowData, 'DEDUCCIONES')}></Column>
                <Column field="LIQUIDO" header="LIQUIDO" sortable body={(rowData) => currencyTemplate(rowData, 'LIQUIDO')}></Column>
                <Column field="EMPLEADOS" header="EMPLEADOS" sortable body={empleadosTemplate}></Column>
            </DataTable>

            <hr className={styles.separador} />

            {/* Tabla de datos totales */}
            <div className={styles.totalTable}>
                <DataTable
                    value={datosTotales}
                    paginator={false}
                    rows={10}
                    className="p-datatable-sm"
                >
                    <Column field="ANIO" header="AÑO" sortable></Column>
                    <Column field="QUINCENA" header="QUINCENA" sortable></Column>
                    <Column field="NOMINA" header="NOMINA" sortable body={tipoNominaTemplate}></Column>
                    <Column field="BANCO" header="BANCO" sortable></Column>
                    <Column field="PERCEPCIONES" header="PERCEPCIONES" sortable body={(rowData) => currencyTemplate(rowData, 'PERCEPCIONES')}></Column>
                    <Column field="DEDUCCIONES" header="DEDUCCIONES" sortable body={(rowData) => currencyTemplate(rowData, 'DEDUCCIONES')}></Column>
                    <Column field="LIQUIDO" header="LIQUIDO" sortable body={(rowData) => currencyTemplate(rowData, 'LIQUIDO')}></Column>
                    <Column field="EMPLEADOS" header="EMPLEADOS" sortable></Column>
                </DataTable>
            </div>

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
    );
}
