'use client';

import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    Box,
    Typography,
    Collapse,
    Checkbox,
    FormControlLabel,
    Grid,
    Modal,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import API_BASE_URL from '../../%Config/apiConfig';

const availableColumns = [
    { key: 'Registro', label: 'Registro' },
    { key: 'Quincena', label: 'Quincena' },
    { key: 'No. Empleado', label: 'No. Empleado' },
    { key: 'Nombre', label: 'Nombre' },
    { key: 'Percepciones', label: 'Percepciones' },
    { key: 'Deducciones', label: 'Deducciones' },
    { key: 'Monto Neto', label: 'Monto Neto' },
    { key: 'Periodo', label: 'Periodo' },
];

export default function ReporteDeMovimientoPorQuincena() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState({});
    const [collapseOpen, setCollapseOpen] = useState(false);
    const [quincenas, setQuincenas] = useState(['01']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        const queryQuincenas = quincenas.join(',');
        const url = `${API_BASE_URL}/reporteMovimientos?anio=2024&quincenas=${queryQuincenas}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error al obtener los datos: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result);
            setFilteredData(result);
        } catch (error) {
            setError('No se pudieron cargar los datos. Verifique la conexión o contacte al administrador.');
        } finally {
            setLoading(false);
        }
    };

    const mapColumns = (cols) =>
        cols.map((col) => ({
            field: col.key,
            headerName: col.label,
            flex: 1,
            minWidth: 150,
        }));

    useEffect(() => {
        const initialColumns = mapColumns(
            availableColumns.filter((col) => col.key === 'Registro' || col.key === 'Nombre')
        );
        setColumns(initialColumns);

        const initialSelection = availableColumns.reduce((acc, col) => {
            acc[col.key] = false;
            return acc;
        }, {});
        setSelectedColumns(initialSelection);

        fetchData();
    }, []);

    const handleGenerateTable = () => {
        const selectedKeys = Object.keys(selectedColumns).filter((key) => selectedColumns[key]);

        if (selectedKeys.length === 0) {
            setModalOpen(true);
            return;
        }

        const newColumns = mapColumns(availableColumns.filter((col) => selectedKeys.includes(col.key)));
        setColumns(newColumns);
        setCollapseOpen(false);
    };

    const handleSelectAll = (isChecked) => {
        const updatedSelection = availableColumns.reduce((acc, col) => {
            acc[col.key] = isChecked;
            return acc;
        }, {});
        setSelectedColumns(updatedSelection);
    };

    const exportToCSV = () => {
        const csvRows = [];
        const headers = columns.map((col) => col.headerName).join(',');
        csvRows.push(headers);

        filteredData.forEach((row) => {
            const values = columns.map((col) => row[col.field]);
            csvRows.push(values.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'reporte_movimientos.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableColumns = columns.map((col) => col.headerName);
        const tableRows = filteredData.map((row) =>
            columns.map((col) => row[col.field])
        );
        autoTable(doc, { head: [tableColumns], body: tableRows });
        doc.save('reporte_movimientos.pdf');
    };

    const exportToExcel = () => {
        const exportData = filteredData.map((row) => {
            const filteredRow = {};
            columns.forEach((col) => {
                filteredRow[col.field] = row[col.field];
            });
            return filteredRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'reporte_movimientos.xlsx');
        a.click();
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" padding="20px">
            <Typography variant="h4" gutterBottom>
                Reporte: Movimientos por Quincena
            </Typography>

            <Grid container spacing={2} justifyContent="center" marginBottom="20px">
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        label="Quincenas (separadas por coma)"
                        value={quincenas.join(',')}
                        onChange={(e) => setQuincenas(e.target.value.split(','))}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={fetchData}
                        disabled={loading}
                        style={{ height: '56px' }}
                    >
                        {loading ? 'Cargando...' : 'Consultar'}
                    </Button>
                </Grid>
            </Grid>

            {error && (
                <Typography color="error" variant="body1" marginBottom="20px">
                    {error}
                </Typography>
            )}

            <Button
                variant="contained"
                onClick={() => setCollapseOpen(!collapseOpen)}
                style={{ marginBottom: '20px' }}
            >
                Seleccionar Columnas
            </Button>

            <Collapse in={collapseOpen}>
                <Box padding="20px" border="1px solid #c4c4c4" borderRadius="8px" maxWidth="1200px" margin="20px auto">
                    <Typography variant="h6" align="center" gutterBottom>
                        Campos para generar tabla
                    </Typography>
                    <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="10px">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={Object.values(selectedColumns).every((val) => val)}
                                    indeterminate={
                                        Object.values(selectedColumns).some((val) => val) &&
                                        !Object.values(selectedColumns).every((val) => val)
                                    }
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            }
                            label="Todos los campos"
                            style={{ gridColumn: 'span 3' }}
                        />
                        {availableColumns.map((col) => (
                            <FormControlLabel
                                key={col.key}
                                control={
                                    <Checkbox
                                        checked={selectedColumns[col.key] || false}
                                        onChange={(e) =>
                                            setSelectedColumns({
                                                ...selectedColumns,
                                                [col.key]: e.target.checked,
                                            })
                                        }
                                        name={col.key}
                                    />
                                }
                                label={col.label}
                            />
                        ))}
                    </Box>
                    <Box textAlign="center" marginTop="20px">
                        <Button variant="contained" color="primary" onClick={handleGenerateTable}>
                            Generar Tabla
                        </Button>
                    </Box>
                </Box>
            </Collapse>

            <Box height="500px" width="100%" maxWidth="1200px">
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    getRowId={(row) => row.Registro}
                />
            </Box>

            <Box display="flex" gap="10px" marginTop="20px">
                <Button variant="outlined" onClick={exportToCSV}>
                    Exportar CSV
                </Button>
                <Button variant="outlined" onClick={exportToExcel}>
                    Exportar Excel
                </Button>
                <Button variant="outlined" onClick={exportToPDF}>
                    Exportar PDF
                </Button>
            </Box>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '400px',
                        bgcolor: 'background.paper',
                        borderRadius: '8px',
                        boxShadow: 24,
                        p: 4,
                        textAlign: 'center',
                    }}
                >
                    <Typography id="modal-title" variant="h6" gutterBottom>
                        Por favor selecciona al menos un campo
                    </Typography>
                    <Box textAlign="center" marginTop="20px">
                        <Button variant="contained" color="primary" onClick={() => setModalOpen(false)}>
                            Cerrar
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
