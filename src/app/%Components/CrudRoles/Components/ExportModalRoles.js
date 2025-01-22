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
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });
        doc.setFontSize(16);
        doc.text('Exportación de Roles', 14, 15);

        const tableColumnHeaders = selectedColumns.map(
            accessor => columns.find(col => col.accessor === accessor)?.label || accessor
        );

        const tableRows = rows.map(row =>
            selectedColumns.map(accessor => row[accessor] || '-')
        );

        doc.autoTable({
            head: [tableColumnHeaders],
            body: tableRows,
            startY: 25,
            styles: {
                halign: 'left',
                fontSize: 9,
                cellPadding: 2,
            },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 70 },
                2: { cellWidth: 120 },
                3: { cellWidth: 45 },
            },
            headStyles: {
                fillColor: [155, 29, 29],
                textColor: [255, 255, 255],
                fontSize: 11,
            },
            bodyStyles: {
                cellPadding: 2,
                fontSize: 9,
                overflow: 'linebreak',
            },
            margin: { top: 25 },
        });

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
                sx={{   flex: 2,
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "1rem",
                  maxHeight: "70vh",
                  overflowY: "auto",
                }}
                    >
                       <Typography variant="h6" sx={{ marginBottom: "1rem",  fontWeight: "bold" }}>
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
                                        >{row[accessor]}</TableCell>
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
                    disabled={!exportFormat}
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
