'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Collapse, Checkbox, FormControlLabel, Grid, Modal } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import API_BASE_URL from '../../%Config/apiConfig';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';

export default function ReporteDeHonorariosPorFecha() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState({});
    const [collapseOpen, setCollapseOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [startDate, setStartDate] = useState(dayjs('2024-01-02'));
    const [endDate, setEndDate] = useState(dayjs('2024-01-31'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const availableColumns = [
        { key: 'Registro', label: 'Registro' },
        { key: 'ID Honorario', label: 'ID Honorario' },
        { key: 'Nombre Empleado', label: 'Nombre Empleado' },
        { key: 'Puesto', label: 'Puesto' },
        { key: 'Monto Pagado', label: 'Monto Pagado' },
        { key: 'Fecha de Pago', label: 'Fecha de Pago' },
    ];

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/reporteHonorarios?fechaInicio=${startDate.format(
            'YYYY-MM-DD'
        )}&fechaFin=${endDate.format('YYYY-MM-DD')}`;

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
            availableColumns.filter((col) => col.key === 'Registro' || col.key === 'Nombre Empleado')
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
            setShowModal(true); // Mostrar modal si no hay selección
            return;
        }

        const newColumns = mapColumns(availableColumns.filter((col) => selectedKeys.includes(col.key)));
        setColumns(newColumns);
        setCollapseOpen(false);
    };

    const handleFilterChange = (event) => {
        const value = event.target.value.toLowerCase();
        setGlobalFilter(value);

        const filtered = data.filter((row) =>
            Object.values(row).some((val) => val?.toString().toLowerCase().includes(value))
        );
        setFilteredData(filtered);
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

        if (type === 'pdf') {
            const doc = new jsPDF();
            const tableColumns = columns.map((col) => col.headerName);
            const tableRows = exportData.map((row) =>
                columns.map((col) => row[col.field])
            );
            autoTable(doc, { head: [tableColumns], body: tableRows });
            doc.save('reporte_honorarios.pdf');
        } else if (type === 'csv') {
            const csvContent = [
                columns.map((col) => col.headerName).join(','),
                ...exportData.map((row) => columns.map((col) => row[col.field]).join(',')),
            ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'reporte_honorarios.csv');
        } else if (type === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'reporte_honorarios.xlsx');
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" padding="20px">
            <Typography variant="h4" gutterBottom>
                Reporte: Honorarios por Fecha
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2} justifyContent="center" marginBottom="20px">
                    <Grid item xs={12} sm={6} md={3}>
                        <DatePicker
                            label="Fecha de Inicio"
                            value={startDate}
                            onChange={(newStartDate) => setStartDate(newStartDate)}
                            minDate={dayjs('2024-01-01')}
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
            </LocalizationProvider>

            {error && (
                <Typography color="error" variant="body1" marginBottom="20px">
                    {error}
                </Typography>
            )}

            <TextField
                label="Buscar"
                variant="outlined"
                fullWidth
                value={globalFilter}
                onChange={handleFilterChange}
                style={{ marginBottom: '20px', maxWidth: '1200px' }}
            />

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

            <Box height="500px" width="100%" maxWidth="1200px">
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    getRowId={(row) => row.Registro}
                />
            </Box>

            <Box marginTop="20px" display="flex" gap="10px">
                <Button
                    variant="outlined"
                    onClick={() => handleExport('csv')}
                    sx={{
                        borderColor: '#b9274b', // Rojo más tenue
                        color: '#b9274b',       // Texto del mismo color
                        '&:hover': {
                            borderColor: '#b9274b', // Un tono más claro al hacer hover
                            color: '#b9274b',
                        },
                    }}
                >
                    Exportar CSV
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => handleExport('excel')}
                    sx={{
                        borderColor: '#b9274b',
                        color: '#b9274b',
                        '&:hover': {
                            borderColor: '#b9274b',
                            color: '#b9274b',
                        },
                    }}
                >
                    Exportar Excel
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => handleExport('pdf')}
                    sx={{
                        borderColor: '#b9274b',
                        color: '#b9274b',
                        '&:hover': {
                            borderColor: '##b9274b',
                            color: '#b9274b',
                        },
                    }}
                >
                    Exportar PDF
                </Button>
            </Box>



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
                        width: '400px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: 24,
                        p: 4,
                        textAlign: 'center',
                    }}
                >
                    <Typography id="modal-title" variant="h6" gutterBottom>
                        Advertencia
                    </Typography>
                    <Typography id="modal-description" variant="body1" gutterBottom>
                        Por favor selecciona al menos un campo para generar la tabla.
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
    );
}
