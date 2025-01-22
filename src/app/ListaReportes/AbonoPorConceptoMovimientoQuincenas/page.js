// /consultaCLCMovimientoConcepto
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { Collapse } from '@mui/material';
import { ThemeProvider, Typography, Box, Grid } from '@mui/material';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import ColumnSelector from '../../%Components/ColumnSelector/ColumnSelector'; // Asegúrate de tener este componente
import API_BASE_URL from '../../%Config/apiConfig';
import styles from '../page.module.css';
import theme from '../../$tema/theme';

export default function TablaConsultaCLCMovimientoConcepto() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({});
    const [showTable, setShowTable] = useState(false);
    const [collapseOpen, setCollapseOpen] = useState(false);
    const [anio, setAnio] = useState('2024');
    const [codigo, setCodigo] = useState('548');
    const dt = useRef(null);
    const toast = useRef(null);

    const availableColumns = [
        { key: 'anio', label: 'Año', defaultSelected: true },
        { key: 'quincena', label: 'Quincena', defaultSelected: true },
        { key: 'fecha_val', label: 'Fecha de Valor', defaultSelected: true },
        { key: 'movto', label: 'Movimiento', defaultSelected: true },
        { key: 'concepto', label: 'Concepto', defaultSelected: true },
        { key: 'abono', label: 'Abono', defaultSelected: true },
    ];

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/consultaCLCMovimientoConcepto?anio=${anio}&codigo=${codigo}`);
            if (!response.ok) {
                throw new Error('Error al obtener los datos: ' + response.statusText);
            }
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la data.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [anio, codigo]);

    const handleColumnSelectionChange = (selectedColumns) => {
        setVisibleColumns(selectedColumns);
        setShowTable(true);
        setCollapseOpen(false);
    };

    const exportCSV = () => {
        const exportData = data.map(item => {
            let filtered = {};
            Object.keys(visibleColumns).forEach(key => {
                if (visibleColumns[key]) {
                    filtered[key] = item[key];
                }
            });
            return filtered;
        });

        dt.current.exportCSV({ data: exportData });
    };

    const exportPdf = () => {
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default();
                const columns = availableColumns
                    .filter(col => visibleColumns[col.key])
                    .map(col => ({ header: col.label, dataKey: col.key }));
                const rows = data.map(item => {
                    let row = {};
                    availableColumns.forEach(col => {
                        if (visibleColumns[col.key]) {
                            row[col.key] = item[col.key];
                        }
                    });
                    return row;
                });
                doc.autoTable({
                    columns,
                    body: rows,
                });
                doc.save('consulta_clc_movimiento_concepto.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const exportData = data.map(item => {
                let filtered = {};
                Object.keys(visibleColumns).forEach(key => {
                    if (visibleColumns[key]) {
                        filtered[key] = item[key];
                    }
                });
                return filtered;
            });
            const worksheet = xlsx.utils.json_to_sheet(exportData);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            saveAsExcelFile(excelBuffer, 'consulta_clc_movimiento_concepto');
        });
    };

    const saveAsExcelFile = (buffer, fileName) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                const EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], { type: EXCEL_TYPE });
                module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
            }
        });
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <Typography variant="h4" className={styles.titulo}>Consulta de Movimiento de Concepto</Typography>
            <span className="p-input-icon-left" style={{ width: '400px', marginTop: '2rem' }}>
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar..."
                    style={{ width: '100%', marginLeft: '2rem' }}
                />
            </span>
        </div>
    );

    return (
        <ThemeProvider theme={theme}>
            <div className={styles.main}>
            <h1 className={styles.h1}>REPORTE DE NÓMINA HISTÓRICO POR MONTO, TIPO DE NÓMINA Y EJERCIDO</h1>
                <Toast ref={toast} />
                <Box className={styles.dropForm}>
                    <Typography variant="h6" className={styles.exportText}>Parametros de consulta</Typography>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            fetchData();
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <InputText
                                    value={anio}
                                    onChange={(e) => setAnio(e.target.value)}
                                    placeholder="Año"
                                    style={{ width: '80%', padding:"1rem", margin:"2rem"}}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InputText
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    placeholder="Código"
                                    style={{ width: '80%', padding:"1rem", margin:"2rem"}}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            label="Consultar"
                            className="p-button-primary"
                            style={{ marginTop: '1rem', display:"none" }}
                        />
                    </form>
                    <Button
                        type="button"
                        icon={`pi ${collapseOpen ? 'pi-chevron-up' : 'pi-chevron-down'}`}
                        severity="secondary"
                        rounded
                        onClick={() => setCollapseOpen(!collapseOpen)}
                        data-pr-tooltip="Configurar columnas"
                    />
                </Box>

                <Toolbar className="mb-4" right={() => (
                    <div className="flex align-items-center justify-content-end gap-2">
                        <Button
                            type="button"
                            icon="pi pi-file"
                            rounded
                            onClick={() => exportCSV()}
                            data-pr-tooltip="CSV"
                        />
                        <Button
                            type="button"
                            icon="pi pi-file-excel"
                            severity="success"
                            rounded
                            onClick={() => exportExcel()}
                            data-pr-tooltip="XLS"
                        />
                        <Button
                            type="button"
                            icon="pi pi-file-pdf"
                            severity="warning"
                            rounded
                            onClick={() => exportPdf()}
                            data-pr-tooltip="PDF"
                        />
                    </div>
                )} />

                <Collapse in={collapseOpen}>
                    <Box className="p-3">
                        <ColumnSelector
                            availableColumns={availableColumns}
                            onSelectionChange={handleColumnSelectionChange}
                        />
                    </Box>
                </Collapse>

                {isLoading ? (
                    <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
                ) : (
                    showTable && (
                        <DataTable
                            ref={dt}
                            value={data}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            globalFilter={globalFilter}
                            header={header}
                            responsiveLayout="scroll"
                            className="p-datatable-sm p-datatable-gridlines"
                        >
                            {availableColumns.map(
                                (column) =>
                                    visibleColumns[column.key] && (
                                        <Column
                                            key={column.key}
                                            field={column.key}
                                            header={column.label}
                                            sortable
                                        />
                                    )
                            )}
                        </DataTable>
                    )
                )}
            </div>
        </ThemeProvider>
    );
}
