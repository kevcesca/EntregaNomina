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
import 'jspdf-autotable'; // Asegúrate de que esta biblioteca esté instalada
import * as XLSX from 'xlsx';
import styles from '../Components/ExportModalRoles'; // Agrega tus estilos personalizados si es necesario

const ExportTableModal = ({ open, onClose, rows, columns }) => {
    const [selectedColumns, setSelectedColumns] = useState(columns.map(col => col.accessor));
    const [exportFormat, setExportFormat] = useState('');

    const handleColumnToggle = (accessor) => {
        setSelectedColumns(prev =>
            prev.includes(accessor)
                ? prev.filter(col => col !== accessor)
                : [...prev, accessor]
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
                selectedColumns.reduce((acc, accessor) => {
                    acc[accessor] = row[accessor];
                    return acc;
                }, {})
            )
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, 'export.csv');
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            rows.map(row =>
                selectedColumns.reduce((acc, accessor) => {
                    acc[accessor] = row[accessor];
                    return acc;
                }, {})
            )
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, 'export.xlsx');
    };

    const exportToPDF = () => {
        const doc = new jsPDF({
            orientation: 'landscape', // Horizontal
            unit: 'mm',
            format: 'a4',
        });
    
        // Título del documento
        doc.setFontSize(10);
        doc.text('Exportación de Roles', 14, 15);
    
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
const dynamicColumnWidth = pageWidth / selectedColumns.length; // Ancho promedio por columna

    
        // Generación de la tabla
        doc.autoTable({
            head: [tableColumnHeaders],
            body: tableRows,
            startY: 25, // Espacio debajo del título
            styles: {
                halign: 'center', // Centrar el contenido de las celdas
                fontSize: 8, // Reducir tamaño de fuente general
                cellPadding: 2, // Espaciado interno de celdas
            },
            columnStyles: {
                0: { cellWidth: 30 }, // Ancho para la columna ID
                1: { cellWidth: 60 }, // Ancho para la columna Nombre
                2: { cellWidth: 100 }, // Ancho para la columna Descripción
                3: { cellWidth: 80 }, // Ancho para la columna Permisos.
            },
            headStyles: {
                fillColor: [155, 29, 29], // Color de fondo del encabezado
                textColor: [255, 255, 255], // Color de texto del encabezado
                fontSize: 9,
                halign: 'center', // Centrar texto del encabezado
            },
            bodyStyles: {
                cellPadding: 3,
                fontSize: 8, // Reducir tamaño de fuente en celdas
                halign: 'center', // Centrar contenido de las celdas
                overflow: 'linebreak', // Ajustar texto largo con salto de línea
            },
            margin: { left: 10, right: 10 }, // Márgenes laterales
        });
    
        // Descargar PDF
        doc.save('roles.pdf');
    };
    


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg"
            sx={{
                "& .MuiDialog-paper": {
                    height: "85vh",
                    maxWidth: "95%",
                    padding: "16px",
                },
            }}
        >
            <DialogTitle>Exportar Datos</DialogTitle>
            <DialogContent
                className={styles.dialogContent}
                sx={{
                    display: "flex",
                    gap: "1.5rem",
                    width: "100%",
                }}
            >
                <div style={{ flex: 1 }}>
                    <FormControl fullWidth >
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

                </div>
                <TableContainer
                    sx={{
                        flex: 2,
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "1rem",
                        maxHeight: "70vh",
                        overflowY: "auto",
                    }}
                >
                    <Typography variant="h6" sx={{ marginBottom: "1rem", fontWeight: "bold" }}>
                        Vista Previa
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {selectedColumns.map(accessor => (
                                    <TableCell key={accessor}
                                        sx={{
                                            backgroundColor: "#9b1d1d",
                                            color: "white",
                                            fontWeight: "bold",
                                            textAlign: "center",
                                            whiteSpace: "nowrap",
                                        }}>
                                        {columns.find(col => col.accessor === accessor)?.label || accessor}

                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow key={index}>
                                    {selectedColumns.map(accessor => (
                                        <TableCell key={accessor}
                                            sx={{
                                                textAlign: "left",
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                                maxWidth: "150px", // Ajusta según tus necesidades
                                            }}
                                        >
                                            {row[accessor]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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
    );
};

ExportTableModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    rows: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
};

export default ExportTableModal;