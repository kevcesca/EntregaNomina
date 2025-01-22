'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Box, Typography, Collapse, Checkbox, FormControlLabel, Modal } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import API_BASE_URL from '../../%Config/apiConfig';

export default function TablaConsultaMovimientosBitacora() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState({});
    const [collapseOpen, setCollapseOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [anio, setAnio] = useState('2024');
    const [quincenas, setQuincenas] = useState(['02', '04', '06']);
    const [campo, setCampo] = useState('curp');

    const availableColumns = [
        { key: 'anio', label: 'Año' },
        { key: 'quincena', label: 'Quincena' },
        { key: 'nomina', label: 'Nómina' },
        { key: 'campo', label: 'Campo' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellido_1', label: 'Apellido Paterno' },
        { key: 'apellido_2', label: 'Apellido Materno' },
        { key: 'valor_inicial', label: 'Valor Inicial' },
        { key: 'valor_final', label: 'Valor Final' },
    ];

    const fetchData = async () => {
        try {
            const queryParams = quincenas.map((q) => `quincena=${q}`).join('&');
            const response = await fetch(`${API_BASE_URL}/consultaMovimientosBitacora?anio=${anio}&${queryParams}&campo=${campo}`);
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const json = await response.json();
            setData(json);
            setFilteredData(json);
        } catch (error) {
            console.error('Error al cargar los datos:', error);
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
        fetchData();

        const initialColumns = mapColumns(
            availableColumns.filter((col) => col.key === 'anio' || col.key === 'quincena')
        );
        setColumns(initialColumns);

        const initialSelection = availableColumns.reduce((acc, col) => {
            acc[col.key] = false;
            return acc;
        }, {});
        setSelectedColumns(initialSelection);
    }, []);

    const handleConsultar = () => {
        fetchData();
    };

    const handleFilterChange = (event) => {
        const value = event.target.value.toLowerCase();
        setGlobalFilter(value);

        const filtered = data.filter((row) =>
            Object.values(row).some((val) => val?.toString().toLowerCase().includes(value))
        );
        setFilteredData(filtered);
    };

    const handleGenerateTable = () => {
        const selectedKeys = Object.keys(selectedColumns).filter((key) => selectedColumns[key]);

        if (selectedKeys.length === 0) {
            setShowModal(true);
            return;
        }

        const newColumns = mapColumns(availableColumns.filter((col) => selectedKeys.includes(col.key)));
        setColumns(newColumns);
        setCollapseOpen(false);
    };

    const handleColumnSelectionChange = (event) => {
        setSelectedColumns({
            ...selectedColumns,
            [event.target.name]: event.target.checked,
        });
    };

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        const updatedSelection = availableColumns.reduce((acc, col) => {
            acc[col.key] = isChecked;
            return acc;
        }, {});
        setSelectedColumns(updatedSelection);
    };

    const handleExport = (type) => {
        const filteredExportData = filteredData.map((row) => {
            const filteredRow = {};
            columns.forEach((col) => {
                filteredRow[col.field] = row[col.field];
            });
            return filteredRow;
        });

        if (type === 'pdf') {
            const doc = new jsPDF();
            const tableColumns = columns.map((col) => col.headerName);
            const tableRows = filteredExportData.map((row) =>
                columns.map((col) => row[col.field])
            );
            autoTable(doc, { head: [tableColumns], body: tableRows });
            doc.save('consulta_movimientos_bitacora.pdf');
        } else if (type === 'csv') {
            const csvContent = [
                columns.map((col) => col.headerName).join(','),
                ...filteredExportData.map((row) =>
                    columns.map((col) => row[col.field]).join(',')
                ),
            ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'consulta_movimientos_bitacora.csv');
        } else if (type === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            saveAs(
                new Blob([excelBuffer], { type: 'application/octet-stream' }),
                'consulta_movimientos_bitacora.xlsx'
            );
        }
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" padding="20px">
            <Typography variant="h4" gutterBottom>
                Consulta de Movimientos de Bitácora
            </Typography>

            <Box display="flex" gap="20px" marginBottom="20px">
                <TextField
                    label="Año"
                    variant="outlined"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                />
                <TextField
                    label="Quincenas (separadas por coma)"
                    variant="outlined"
                    value={quincenas.join(', ')}
                    onChange={(e) => setQuincenas(e.target.value.split(',').map((q) => q.trim()))}
                />
                <TextField
                    label="Campo"
                    variant="outlined"
                    value={campo}
                    onChange={(e) => setCampo(e.target.value)}
                />
                <Button variant="contained" onClick={handleConsultar}>
                    Consultar
                </Button>
            </Box>

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
                    <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="10px">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={Object.values(selectedColumns).every((val) => val)}
                                    indeterminate={
                                        Object.values(selectedColumns).some((val) => val) &&
                                        !Object.values(selectedColumns).every((val) => val)
                                    }
                                    onChange={handleSelectAll}
                                />
                            }
                            label="Todos los campos"
                            style={{ gridColumn: 'span 4' }}
                        />
                        {availableColumns.map((col) => (
                            <FormControlLabel
                                key={col.key}
                                control={
                                    <Checkbox
                                        checked={selectedColumns[col.key] || false}
                                        onChange={handleColumnSelectionChange}
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
                    getRowId={(row) => row.anio + row.quincena}
                />
            </Box>

            <Box marginTop="20px" display="flex" gap="10px">
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
    );
}
