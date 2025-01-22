import React, { useState, useRef } from "react";
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
  Typography,
  ThemeProvider,
} from "@mui/material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Toast } from "primereact/toast";
import theme from "../../$tema/theme";
import styles from "../components/Export.module.css";

const ExportTableModal = ({ open, onClose, rows, columns }) => {
  const [selectedColumns, setSelectedColumns] = useState(columns.map((col) => col.accessor));
  const [exportFormat, setExportFormat] = useState("");
  const toastRef = useRef(null);

  const handleColumnToggle = (accessor) => {
    setSelectedColumns((prev) =>
      prev.includes(accessor) ? prev.filter((col) => col !== accessor) : [...prev, accessor]
    );
  };

  const handleExport = () => {
    if (!exportFormat) {
      toastRef.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "Selecciona un formato válido para exportar.",
        life: 3000,
      });
      return;
    }

    const filteredData = rows.map((row) =>
      selectedColumns.reduce((acc, accessor) => {
        acc[accessor] = row[accessor] || "Sin contenido";
        return acc;
      }, {})
    );

    switch (exportFormat) {
      case "pdf":
        exportToPDF(filteredData);
        break;
      case "excel":
        exportToExcel(filteredData);
        break;
      case "csv":
        exportToCSV(filteredData);
        break;
      default:
        break;
    }
  };

  const exportToPDF = (filteredData) => {
    const doc = new jsPDF();
    const tableColumns = selectedColumns.map(
      (accessor) => columns.find((col) => col.accessor === accessor)?.label || accessor
    );
    const tableData = filteredData.map((row) =>
      selectedColumns.map((accessor) =>
        row[accessor]?.length > 30 ? `${row[accessor].slice(0, 30)}...` : row[accessor] || "-"
      )
    );

    autoTable(doc, {
        head: [tableColumns],
      body: tableData,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 3, overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: 15 }, // Ancho fijo para la primera columna
        1: { cellWidth: 40 }, // Personaliza según la necesidad
        2: { cellWidth: 20 },
      },
      theme: "striped",
      headStyles: {
        fillColor: [155, 29, 29],
        textColor: [255, 255, 255],
      },
      margin: { left: 10, right: 10 },
    });

    doc.save("datosEmpleados.pdf");
  };

  const exportToExcel = (filteredData) => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
    XLSX.writeFile(workbook, "datosEmpleados.xlsx");
  };

  const exportToCSV = (filteredData) => {
    const csvString = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(filteredData));
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "datosEmpleados.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ThemeProvider theme={theme}>
      <Toast ref={toastRef} />
      <Dialog   open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            height: "85vh",
            maxWidth: "95%",
            padding: "16px",
          },
        }}>
        <DialogTitle>Exportar Datos</DialogTitle>
        <DialogContent  className={styles.dialogContent}
          sx={{
            display: "flex",
            gap: "1.5rem",
            width: "100%",
          }}>
          {/* Selección de formato y columnas */}
          <div style={{ flex: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Formato</InputLabel>
              <Select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
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

          {/* Vista previa */}
          <TableContainer sx={{   flex: 2,
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
                  {selectedColumns.map((accessor) => (
                    <TableCell
                      key={accessor}
                      sx={{
                        backgroundColor: "#9b1d1d",
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {columns.find((col) => col.accessor === accessor)?.label || accessor}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <TableRow key={index}>
                      {selectedColumns.map((accessor) => (
                        <TableCell
                          key={accessor}
                          sx={{
                            textAlign: "left",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            maxWidth: "150px", // Ajusta según tus necesidades
                          }}
                        >
                          {row[accessor] || "Sin contenido"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={selectedColumns.length} sx={{ textAlign: "center" }}>
                      No hay datos seleccionados para exportar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained" color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleExport} variant="contained" color="primary" disabled={!exportFormat}>
            Exportar
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

ExportTableModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  rows: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
};

export default ExportTableModal;
