'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Checkbox,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Box,
    ThemeProvider,
} from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import styles from '../ReusableTable2.module.css'; // Asegúrate de crear un archivo de estilos si necesitas personalización
import theme from '../../../$tema/theme';

const ExportModal = ({ open, onClose, selectedRows, columns }) => {
    const [selectedColumns, setSelectedColumns] = useState(columns.map((col) => col.accessor));
    const [exportFormat, setExportFormat] = useState('');

    // Manejar la selección de columnas
    const handleColumnToggle = (accessor) => {
        setSelectedColumns((prev) =>
            prev.includes(accessor)
                ? prev.filter((col) => col !== accessor)
                : [...prev, accessor]
        );
    };

    // Exportar datos según el formato seleccionado
    const handleExport = () => {
        const filteredData = selectedRows.map((row) =>
            selectedColumns.reduce((acc, accessor) => {
                acc[accessor] = row[accessor];
                return acc;
            }, {})
        );

        switch (exportFormat) {
            case 'csv':
                exportToCSV(filteredData);
                break;
            case 'excel':
                exportToExcel(filteredData);
                break;
            case 'pdf':
                exportToPDF(filteredData);
                break;
            default:
                alert('Selecciona un formato válido.');
                break;
        }
    };

    // Exportar a CSV
    const exportToCSV = (filteredData) => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Universos');
        XLSX.writeFile(workbook, 'universos.csv');
    };

    // Exportar a Excel
    const exportToExcel = (filteredData) => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Universos');
        XLSX.writeFile(workbook, 'universos.xlsx');
    };

    // Exportar a PDF
    const exportToPDF = (filteredData) => {
        const doc = new jsPDF();
        const tableColumns = selectedColumns.map((accessor) =>
            columns.find((col) => col.accessor === accessor)?.label || accessor
        );
        const tableData = filteredData.map((row) =>
            selectedColumns.map((accessor) => row[accessor] || 'Sin contenido')
        );

        autoTable(doc, {
            head: [tableColumns],
            body: tableData,
            styles: { fontSize: 9 },
            headStyles: {
                fillColor: [155, 29, 29],
                textColor: [255, 255, 255],
            },
        });
        doc.save('universos.pdf');
    };

    return (
        <ThemeProvider theme={theme}>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
                <DialogTitle>Exportar Universos</DialogTitle>
                <DialogContent>
                    <Box display="flex" gap={3}>
                        {/* Sección izquierda: Formato y selección de columnas */}
                        <Box flex={1}>
                            <FormControl fullWidth>
                                <InputLabel>Formato</InputLabel>
                                <Select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                >
                                    <MenuItem value="pdf">PDF</MenuItem>
                                    <MenuItem value="excel">Excel</MenuItem>
                                    <MenuItem value="csv">CSV</MenuItem>
                                </Select>
                            </FormControl>

                            <Typography variant="h6" sx={{ marginTop: 2 }}>
                                Seleccionar Columnas
                            </Typography>
                            {columns.map((col) => (
                                <FormControlLabel
                                    key={col.accessor}
                                    control={
                                        <Checkbox
                                            checked={selectedColumns.includes(col.accessor)}
                                            onChange={() => handleColumnToggle(col.accessor)}
                                        />
                                    }
                                    label={col.label}
                                />
                            ))}
                        </Box>

                        {/* Vista previa */}
                        <Box flex={2}>
                            <Typography variant="h6" align="center" gutterBottom>
                                Vista Previa
                            </Typography>
                            <TableContainer
                                sx={{
                                    border: '1px solid #ddd',
                                    borderRadius: 2,
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                }}
                            >
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {selectedColumns.map((accessor) => (
                                                <TableCell
                                                    key={accessor}
                                                    sx={{
                                                        backgroundColor: '#9b1d1d',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {columns.find((col) => col.accessor === accessor)?.label ||
                                                        accessor}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedRows.length > 0 ? (
                                            selectedRows.map((row, index) => (
                                                <TableRow key={index}>
                                                    {selectedColumns.map((accessor) => (
                                                        <TableCell key={accessor}>
                                                            {row[accessor] || 'Sin contenido'}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={selectedColumns.length}
                                                    align="center"
                                                >
                                                    No hay datos seleccionados para exportar.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="secondary" variant="contained">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleExport}
                        color="primary"
                        variant="contained"
                        disabled={!exportFormat || selectedColumns.length === 0}
                    >
                        Exportar
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

ExportModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedRows: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
};

export default ExportModal;
