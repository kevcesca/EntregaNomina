import React, { useState } from "react";
import PropTypes from "prop-types";
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
    ThemeProvider,
} from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import styles from "../ReusableTable2.module.css"; // Asegúrate de crear un archivo de estilos si necesitas personalización
import theme from "../../../$tema/theme";

const ExportModal = ({ open, onClose, selectedRows, columns }) => {
    const [selectedColumns, setSelectedColumns] = useState(columns.map((col) => col.accessor));
    const [exportFormat, setExportFormat] = useState(""); // Estado para seleccionar el formato de exportación

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
            case "csv":
                exportToCSV(filteredData);
                break;
            case "excel":
                exportToExcel(filteredData);
                break;
            case "pdf":
                exportToPDF(filteredData);
                break;
            default:
                alert("Selecciona un formato válido.");
                break;
        }
    };

    // Exportar a CSV
    const exportToCSV = (filteredData) => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, "export.csv");
    };

    // Exportar a Excel
    const exportToExcel = (filteredData) => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, "export.xlsx");
    };

    // Exportar a PDF
    const exportToPDF = (filteredData) => {
        const doc = new jsPDF();
        const tableColumns = selectedColumns.map((accessor) =>
            columns.find((col) => col.accessor === accessor)?.label || accessor
        );
        const tableData = filteredData.map((row) =>
            selectedColumns.map((accessor) => row[accessor])
        );

        autoTable(doc, {
            head: [tableColumns],
            body: tableData,
        });
        doc.save("export.pdf");
    };

    return (
        <ThemeProvider theme={theme}>
            <Dialog className={styles.dialog} open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>Exportar Datos</DialogTitle>
                <DialogContent>
                    <div className={styles.modalContent}>
                        <div className={styles.leftColumn}>
                            {/* Selección de formato */}
                            <div className={styles.formatSection}>
                                <FormControl fullWidth>
                                    <InputLabel>Formato</InputLabel>
                                    <Select
                                        value={exportFormat}
                                        onChange={(e) => setExportFormat(e.target.value)}
                                        displayEmpty
                                    >
                                        <MenuItem value="pdf">PDF</MenuItem>
                                        <MenuItem value="excel">Excel</MenuItem>
                                        <MenuItem value="csv">CSV</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            {/* Selección de columnas */}
                            <div className={styles.columnSection}>
                                <h3>Seleccionar Columnas</h3>
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
                            </div>

                            <DialogActions>
                                <Button onClick={onClose} variant="contained" color="secondary">
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleExport}
                                    variant="contained"
                                    color="primary"
                                    disabled={!exportFormat} // Deshabilitar si no se selecciona formato
                                >
                                    Exportar
                                </Button>
                            </DialogActions>
                        </div>

                        {/* Vista previa */}
                        <TableContainer>
                            <h3>Vista Previa</h3>
                            <Table>
                                <TableHead className={styles.tableHead}>
                                    <TableRow>
                                        {selectedColumns.map((accessor) => (
                                            <TableCell className={styles.tWthite} key={accessor}>
                                                {columns.find((col) => col.accessor === accessor)?.label ||
                                                    accessor}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedRows.map((row, index) => (
                                        <TableRow key={index}>
                                            {selectedColumns.map((accessor) => (
                                                <TableCell key={accessor}>{row[accessor]}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </DialogContent>
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
