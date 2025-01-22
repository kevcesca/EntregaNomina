'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Collapse, Checkbox, FormControlLabel, Grid, Modal } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import saveAs from 'file-saver';
import API_BASE_URL from '../../%Config/apiConfig';

// Definición de las columnas disponibles (mover al inicio del componente)
const availableColumns = [
    { key: 'Registro', label: 'Registro' },
    { key: 'No. Empleado', label: 'No. Empleado' },
    { key: 'Nombre', label: 'Nombre' },
    { key: 'Tipo de Nómina', label: 'Tipo de Nómina' },
    { key: 'Primera QNA en la que Aparece el Empleado', label: 'Primera QNA' },
    { key: 'Fecha de Alta', label: 'Fecha de Alta' },
];

export default function ReporteDeAltas() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [idEmpleado, setIdEmpleado] = useState('');
    const [startDate, setStartDate] = useState(dayjs('2024-01-01'));
    const [endDate, setEndDate] = useState(dayjs('2024-12-31'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedColumns, setSelectedColumns] = useState(
        availableColumns.reduce((acc, col) => {
            acc[col.key] = false; // Inicializamos todas las columnas desmarcadas.
            return acc;
        }, {})
    );
    const [collapseOpen, setCollapseOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [columns, setColumns] = useState(
        availableColumns.map((col) => ({
            field: col.key,
            headerName: col.label,
            flex: 1,
            minWidth: 150,
        }))
    );

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        if (!idEmpleado) {
            setError('Por favor, ingresa un ID de empleado para realizar la búsqueda.');
            setLoading(false);
            return;
        }

        const url = `${API_BASE_URL}/reporteAltas?idEmpleado=${idEmpleado}`;
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

    const handleFilterChange = (event) => {
        const value = event.target.value.toLowerCase();
        const filtered = data.filter((row) =>
            Object.values(row).some((val) => val?.toString().toLowerCase().includes(value))
        );
        setFilteredData(filtered);
    };

    const handleGenerateTable = () => {
        const selectedKeys = Object.keys(selectedColumns).filter((key) => selectedColumns[key]);
        if (selectedKeys.length === 0) {
            setShowModal(true); // Muestra el modal si no hay columnas seleccionadas
            return;
        }
        const newColumns = availableColumns
            .filter((col) => selectedKeys.includes(col.key))
            .map((col) => ({
                field: col.key,
                headerName: col.label,
                flex: 1,
                minWidth: 150,
            }));
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

    const handleExport = (type) => {
        const exportData = filteredData.map((row) => {
            const filteredRow = {};
            columns.forEach((col) => {
                filteredRow[col.field] = row[col.field];
            });
            return filteredRow;
        });

        if (type === 'csv') {
            const csvContent = [
                columns.map((col) => col.headerName).join(','),
                ...exportData.map((row) => columns.map((col) => row[col.field]).join(',')),
            ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'reporte_altas.csv');
        } else if (type === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            saveAs(
                new Blob([excelBuffer], { type: 'application/octet-stream' }),
                'reporte_altas.xlsx'
            );
        } else if (type === 'pdf') {
            const doc = new jsPDF();
            const tableColumns = columns.map((col) => col.headerName);
            const tableRows = exportData.map((row) => columns.map((col) => row[col.field]));
            autoTable(doc, { head: [tableColumns], body: tableRows });
            doc.save('reporte_altas.pdf');
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display="flex" flexDirection="column" alignItems="center" padding="20px">
                <Typography variant="h4" gutterBottom>
                    Reporte: Altas de Empleados
                </Typography>

                {/* Parámetros */}
                <Grid container spacing={2} justifyContent="center" marginBottom="20px">
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="ID Empleado"
                            value={idEmpleado}
                            onChange={(e) => setIdEmpleado(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DatePicker
                            label="Fecha de Inicio"
                            value={startDate}
                            onChange={(newStartDate) => setStartDate(newStartDate)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DatePicker
                            label="Fecha de Fin"
                            value={endDate}
                            onChange={(newEndDate) => setEndDate(newEndDate)}
                            minDate={startDate}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
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

                {/* Buscar */}
                <TextField
                    label="Buscar"
                    variant="outlined"
                    fullWidth
                    onChange={handleFilterChange}
                    style={{ marginBottom: '20px', maxWidth: '1200px' }}
                />

                {/* Seleccionar columnas */}
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

                {/* Tabla */}
                <Box height="500px" width="100%" maxWidth="1200px">
                    <DataGrid
                        rows={filteredData}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 20, 50]}
                        getRowId={(row) => row.Registro}
                    />
                </Box>

                {/* Exportar */}
                <Box display="flex" gap="10px" marginTop="20px">
                    <Button variant="outlined" onClick={() => handleExport('csv')}>
                        Exportar CSV
                    </Button>
                    <Button variant="outlined" onClick={() => handleExport('excel')}>
                        Exportar Excel
                    </Button>
                    <Button variant="outlined" onClick={() => handleExport('pdf')}>
                        Exportar PDF
                    </Button>
                </Box>

                {/* Modal */}
                <Modal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '50%',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: 24,
                            p: 4,
                            textAlign: 'center',
                        }}
                    >
                        <Typography id="modal-title" variant="h6" gutterBottom>
                            Por favor selecciona al menos un campo
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setShowModal(false)}
                        >
                            Cerrar
                        </Button>
                    </Box>
                </Modal>
            </Box>
        </LocalizationProvider>
    );
}
