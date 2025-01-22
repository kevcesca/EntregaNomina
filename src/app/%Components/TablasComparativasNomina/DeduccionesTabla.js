'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode, FilterService } from 'primereact/api';
import axios from 'axios';
import { Button, Box } from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from './Tablas.module.css';
import API_BASE_URL from '../../%Config/apiConfig';

// Registrar filtro personalizado
FilterService.register('custom_range', (value, filter) => {
    const [from, to] = filter ?? [null, null];
    if (from === null && to === null) return true;
    if (from !== null && to === null) return from <= value;
    if (from === null && to !== null) return value <= to;
    return from <= value && value <= to;
});

export default function DeduccionesTabla({ anio, quincena, nombreNomina }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        sectpres: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        nomina: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        id_concepto1: { value: null, matchMode: FilterMatchMode.EQUALS },
        nombre_concepto: { value: null, matchMode: FilterMatchMode.CONTAINS },
        deducciones: { value: null, matchMode: FilterMatchMode.CUSTOM },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    useEffect(() => {
        if (anio && quincena && nombreNomina) {
            fetchData(anio, quincena, nombreNomina);
        }
    }, [anio, quincena, nombreNomina]);

    const fetchData = async (anio, quincena, nombreNomina) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/NominaCtrl/DeduccionesSeparadas`, {
                params: {
                    anio,
                    quincena,
                    nombre: nombreNomina,
                    cancelado: false,
                    completado: true,
                },
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
        setLoading(false);
    };

    // Calcular el total de deducciones
    const totalDeducciones = data.reduce((total, item) => {
        const deduccion = parseFloat(item.deducciones.replace(/,/g, ''));
        return total + (isNaN(deduccion) ? 0 : deduccion);
    }, 0);

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        setFilters((prevFilters) => ({
            ...prevFilters,
            global: { ...prevFilters.global, value },
        }));
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar..." />
                </span>
            </div>
        );
    };

    const currencyTemplate = (rowData) => {
        return parseFloat(rowData.deducciones.replace(/,/g, '')).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const header = renderHeader();

    // Función para exportar a PDF
    const exportPDF = () => {
        const doc = new jsPDF();
        const tableData = data.map(row => [
            row.sectpres,
            row.nomina,
            row.id_concepto1,
            row.nombre_concepto,
            parseFloat(row.deducciones.replace(/,/g, '')).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        ]);

        autoTable(doc, {
            head: [['Sector Presupuestal', 'Nómina', 'ID Concepto', 'Nombre Concepto', 'Deducciones']],
            body: tableData,
        });

        // Añadir el total de deducciones
        doc.text(`Total Deducciones: ${totalDeducciones.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`, 14, doc.lastAutoTable.finalY + 10);

        doc.save(`Deducciones_QNA_${quincena}_${anio}.pdf`);
    };

    // Función para exportar a Excel
    const exportExcel = () => {
        const worksheetData = data.map(row => ({
            'Sector Presupuestal': row.sectpres,
            Nómina: row.nomina,
            'ID Concepto': row.id_concepto1,
            'Nombre Concepto': row.nombre_concepto,
            Deducciones: parseFloat(row.deducciones.replace(/,/g, '')).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        }));

        // Añadir el total como última fila
        worksheetData.push({
            'Sector Presupuestal': '',
            Nómina: '',
            'ID Concepto': '',
            'Nombre Concepto': 'Total',
            Deducciones: totalDeducciones.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `Deducciones_QNA_${quincena}_${anio}.xlsx`);
    };

    // Función para exportar a CSV
    const exportCSV = () => {
        const csvContent = [
            ['Sector Presupuestal', 'Nómina', 'ID Concepto', 'Nombre Concepto', 'Deducciones'].join(','),
            ...data.map(row =>
                [
                    row.sectpres,
                    row.nomina,
                    row.id_concepto1,
                    row.nombre_concepto,
                    parseFloat(row.deducciones.replace(/,/g, '')).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                ].join(',')
            ),
            ['', '', '', 'Total', totalDeducciones.toLocaleString('en-US', { style: 'currency', currency: 'USD' })],
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `Deducciones_QNA_${quincena}_${anio}.csv`);
    };

    return (
        <div className={`card ${styles.card}`}>
            <DataTable
                value={data}
                paginator
                rows={10}
                loading={loading}
                filters={filters}
                filterDisplay="row"
                globalFilterFields={['sectpres', 'nomina', 'nombre_concepto']}
                header={header}
                emptyMessage="No se encontraron datos."
                className="p-datatable-sm"
            >
                <Column field="sectpres" header="Sector Presupuestal" filter filterPlaceholder="Buscar..." sortable />
                <Column field="nomina" header="Nómina" filter filterPlaceholder="Buscar..." sortable />
                <Column field="id_concepto1" header="ID Concepto" filter filterPlaceholder="Buscar..." sortable />
                <Column field="nombre_concepto" header="Nombre Concepto" filter filterPlaceholder="Buscar..." sortable />
                <Column field="deducciones" header="Deducciones" body={currencyTemplate} sortable />
            </DataTable>

            {/* Sección de total */}
            <div className={styles.totalContainer}>
                <h3>Total Deducciones: {totalDeducciones.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h3>
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
