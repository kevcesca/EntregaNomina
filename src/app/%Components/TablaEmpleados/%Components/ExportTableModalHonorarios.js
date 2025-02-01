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
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import styles from './ExportTableModal.module.css';

const ExportTableModal = ({ open, onClose, rows, columns }) => {
    const [selectedColumns, setSelectedColumns] = useState(columns.map(col => col.key));
    const [exportFormat, setExportFormat] = useState('');

    const handleColumnToggle = (key) => {
        setSelectedColumns(prev =>
            prev.includes(key)
                ? prev.filter(col => col !== key)
                : [...prev, key]
        );
    };

    const handleExport = () => {
        if (exportFormat === 'pdf') {
            exportToPDF();
        } else if (exportFormat === 'excel') {
            exportToExcel();
        } else if (exportFormat === 'csv') {
            exportToCSV();
        } else {
            alert('Selecciona un formato válido.');
        }
    };

    const exportToCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            rows.map(row =>
                selectedColumns.reduce((acc, key) => {
                    acc[key] = row[key];
                    return acc;
                }, {})
            )
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
        XLSX.writeFile(workbook, 'honorarios.csv');
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            rows.map(row =>
                selectedColumns.reduce((acc, key) => {
                    acc[key] = row[key];
                    return acc;
                }, {})
            )
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
        XLSX.writeFile(workbook, 'honorarios.xlsx');
    };

    const exportToPDF = () => {
        const doc = new jsPDF({
                         orientation: 'landscape',
                         unit: 'mm',
                         format: 'a4',
                     });
             
                     // Título del documento
                     doc.setFontSize(16);
                     doc.text('Exportación de Usuarios', 14, 15);
             
                     // Encabezados de columna seleccionados
                     const tableColumnHeaders = selectedColumns.map(
                         accessor => columns.find(col => col.accessor === accessor)?.label || accessor
                     );
             
                     // Filas de datos seleccionadas
                     const tableRows = rows.map(row =>
                         selectedColumns.map(accessor => row[accessor] || '-')
                     );
             
                     // Ancho total disponible para la tabla (A4 horizontal: 297mm menos márgenes)
                     const pageWidth = doc.internal.pageSize.getWidth() - 20; // 10mm de margen a cada lado
                     const columnWidth = pageWidth / tableColumnHeaders.length; // Ancho dinámico por columna
             
                     // Generación de la tabla
                     doc.autoTable({
                                 head: [tableColumnHeaders],
                                 body: tableRows,
                                 startY: 25, // Espacio debajo del título
                                 styles: {
                                     halign: 'center', // Centrar el contenido de las celdas
                                     fontSize: 10, // Tamaño de fuente
                                     cellPadding: 3, // Espaciado interno de celdas
                                 },
                                 columnStyles: {
                                     // Configuración dinámica para todas las columnas
                                     0: { cellWidth: columnWidth }, // Aplicar ancho dinámico
                                 },
                                 headStyles: {
                                     fillColor: [155, 29, 29], // Color de fondo del encabezado
                                     textColor: [255, 255, 255], // Color de texto del encabezado
                                     fontSize: 11,
                                     halign: 'center', // Centrar texto del encabezado
                                 },
                                 bodyStyles: {
                                     cellPadding: 3,
                                     fontSize: 9,
                                     halign: 'center', // Centrar contenido de las celdas
                                 },
                                 margin: { left: 10, right: 10 }, // Márgenes laterales
                             });
                     
                             // Descargar PDF
                             doc.save('honorarios.pdf');
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
            <DialogTitle>Exportar Datos</DialogTitle>
            <DialogContent className={styles.dialogContent} sx={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
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

                    <h3>Seleccionar Columnas</h3>
                    {columns.map(col => (
                        <FormControlLabel
                            key={col.key}
                            control={
                                <Checkbox
                                    checked={selectedColumns.includes(col.key)}
                                    onChange={() => handleColumnToggle(col.key)}
                                />
                            }
                            label={col.label}
                        />
                    ))}
                </div>
                <TableContainer sx={{ flex: 2, border: '1px solid #ddd', borderRadius: '8px', padding: '1rem' }}>
                    <Typography variant="h6" sx={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                        Vista Previa</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {selectedColumns.map(key => (
                                    <TableCell key={key}
                                    sx={{ 
                                        backgroundColor: '#9b1d1d', 
                                        color: 'white', 
                                        fontWeight: 'bold' ,
                                        textAlign: "center",
                                        whiteSpace: "nowrap",
                                        wordBreak: 'break-word',
                                        maxWidth: '200px'}}>
                                        {columns.find(col => col.key === key)?.label || key}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow key={index}>
                                    {selectedColumns.map(key => (
                                        <TableCell key={key}
                                        sx={{
                                            textAlign: "left",
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                            maxWidth: "150px", // Ajusta según tus necesidades
                                        }}>{row[key] || '-'}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancelar</Button>
                <Button onClick={handleExport} color="primary" disabled={!exportFormat || selectedColumns.length === 0}>
                    Exportar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ExportTableModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    rows: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
};

export default ExportTableModal;
