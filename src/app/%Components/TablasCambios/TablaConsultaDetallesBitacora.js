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
import { ThemeProvider, Typography, Box } from '@mui/material';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css'; // Asegúrate de que PrimeIcons esté cargado
import ColumnSelector from '../ColumnSelector/ColumnSelector';
import theme from '../../$tema/theme';
import styles from './TablasCambios.module.css';
import API_BASE_URL from '../../%Config/apiConfig';
import AsyncButton from '../AsyncButton/AsyncButton';

export default function TablaConsultaDetallesBitacora({ anio, quincena, tipoNomina }) {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [visibleColumns, setVisibleColumns] = useState({});
    const [showTable, setShowTable] = useState(true); // Mostrar la tabla por defecto
    const [collapseOpen, setCollapseOpen] = useState(false);
    const dt = useRef(null);
    const toast = useRef(null);

    const availableColumns = [
        { key: 'ID Empleado', label: 'ID Empleado', defaultSelected: true },
        { key: 'Nombre', label: 'Nombre', defaultSelected: true },
        { key: 'Apellido 1', label: 'Apellido Paterno', defaultSelected: true },
        { key: 'Campo Modificado', label: 'Campo Modificado', defaultSelected: true },
        { key: 'Valor Inicial', label: 'Valor Inicial', defaultSelected: true },
        { key: 'Valor Final', label: 'Valor Final', defaultSelected: true },
        { key: 'Año', label: 'Año', defaultSelected: false },
        { key: 'Quincena', label: 'Quincena', defaultSelected: false },
        { key: 'Nombre Nómina', label: 'Nombre Nómina', defaultSelected: false },
    ];

    // Solo realizar la solicitud cuando todos los parámetros están definidos
    useEffect(() => {
        if (anio && quincena && tipoNomina) {  // Verificar que todos los parámetros estén disponibles
            const fetchData = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch(`${API_BASE_URL}/consultaDetallesBitacora?anio=${anio}&quincena=${quincena}&tipoNomina=${tipoNomina}`);
                    if (!response.ok) {
                        throw new Error('Error al obtener los datos: ' + response.statusText);
                    }
                    const data = await response.json();
                    setData(data);
                } catch (error) {
                    console.error('Error al obtener los datos:', error);
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al obtener los datos', life: 3000 });
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }
    }, [anio, quincena, tipoNomina]); // Dependencias de los parámetros

    useEffect(() => {
        // Inicializar las columnas visibles con las columnas predeterminadas
        const defaultColumns = availableColumns.reduce((acc, column) => {
            if (column.defaultSelected) {
                acc[column.key] = true;
            }
            return acc;
        }, {});
        setVisibleColumns(defaultColumns);
    }, []);

    const handleColumnSelectionChange = (selectedColumns) => {
        setVisibleColumns(selectedColumns);
        setShowTable(true); // Mostrar la tabla cuando se cambien las columnas
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

                doc.save('consulta_detalles_bitacora.pdf');
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

            saveAsExcelFile(excelBuffer, 'consulta_detalles_bitacora');
        });
    };

    const saveAsExcelFile = (buffer, fileName) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                let EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], { type: EXCEL_TYPE });
                module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
            }
        });
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            
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
            <div className="card">
                <Toast ref={toast} />
                <Box className={styles.ColumnSelector}>
                    <Button
                        type="button"
                        icon="pi pi-filter" // Cambiar el icono a un icono de filtro
                        severity="secondary"
                        rounded
                        onClick={() => setCollapseOpen(!collapseOpen)}
                        data-pr-tooltip="Configurar columnas"
                        className={styles.botonFiltro}
                    />
                </Box>

                <Toolbar className="mb-4" right={() => (
                <div className="flex align-items-center justify-content-end gap-2">
                    <AsyncButton
                            type="button"
                            icon="pi pi-file"
                            rounded
                            onClick={exportCSV}
                            data-pr-tooltip="CSV"
                        >
                            Exportar CSV
                        </AsyncButton>
                        <AsyncButton
                            type="button"
                            icon="pi pi-file-excel"
                            severity="success"
                            rounded
                            onClick={exportExcel}
                            data-pr-tooltip="XLS"
                        >
                            Exportar Excel
                        </AsyncButton>
                        <AsyncButton
                            type="button"
                            icon="pi pi-file-pdf"
                            severity="warning"
                            rounded
                            onClick={exportPdf}
                            data-pr-tooltip="PDF"
                        >
                            Exportar PDF
                        </AsyncButton>
                </div>
            )} />

                <Collapse in={collapseOpen}>
                    <Box>
                        <ColumnSelector
                            availableColumns={availableColumns}
                            onSelectionChange={handleColumnSelectionChange}
                        />
                    </Box>
                </Collapse>

                {isLoading ? (
                    <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
                ) : (
                    <DataTable
                        ref={dt}
                        value={data}
                        paginator
                        rows={10}
                        globalFilter={globalFilter}
                        header={header}
                        showGridlines
                    >
                        {availableColumns
                            .filter(col => visibleColumns[col.key])
                            .map(col => (
                                <Column key={col.key} field={col.key} header={col.label} sortable />
                            ))}
                    </DataTable>
                )}
            </div>
        </ThemeProvider>
    );
}
