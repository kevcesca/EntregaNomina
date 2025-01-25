import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx"; // Biblioteca para Excel
import * as Papa from "papaparse"; // Biblioteca para CSV
import React, { useState, useRef } from "react";
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
} from "@mui/material";
import { Toast } from "primereact/toast";

const ExportModal = ({ open, onClose, selectedRows, columns }) => {
  const [selectedColumns, setSelectedColumns] = useState(columns.map((col) => col.accessor));
  const [exportFormat, setExportFormat] = useState("");
  const toastRef = useRef(null);

  // Manejar el cambio de selección de columnas
  const handleColumnToggle = (accessor) => {
    setSelectedColumns((prev) =>
      prev.includes(accessor) ? prev.filter((col) => col !== accessor) : [...prev, accessor]
    );
  };

  // Función de exportación
  const handleExport = () => {
    if (selectedColumns.length === 0) {
      toastRef.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "Selecciona al menos una columna para exportar.",
        life: 3000,
      });
      return;
    }

    if (exportFormat === "pdf") {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      doc.setFontSize(16);
      doc.text("Exportación de Datos", 14, 15);

      const headers = selectedColumns.map(
        (accessor) => columns.find((col) => col.accessor === accessor)?.label || accessor
      );

      const rows = selectedRows.map((row) =>
        selectedColumns.map((accessor) => row[accessor] || "-")
      );

      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 25,
        styles: {
          fontSize: 9,
          halign: "center",
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [155, 29, 29],
          textColor: [255, 255, 255],
          fontSize: 11,
        },
      });

      doc.save("exportacion.pdf");
    } else if (exportFormat === "excel") {
      const worksheetData = [
        selectedColumns.map(
          (accessor) => columns.find((col) => col.accessor === accessor)?.label || accessor
        ),
        ...selectedRows.map((row) =>
          selectedColumns.map((accessor) => row[accessor] || "-")
        ),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
      XLSX.writeFile(workbook, "exportacion.xlsx");
    } else if (exportFormat === "csv") {
      const csvData = [
        selectedColumns.map(
          (accessor) => columns.find((col) => col.accessor === accessor)?.label || accessor
        ),
        ...selectedRows.map((row) =>
          selectedColumns.map((accessor) => row[accessor] || "-")
        ),
      ];

      const csvString = Papa.unparse(csvData);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "exportacion.csv";
      link.click();
    } else {
      toastRef.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "Selecciona un formato válido para exportar.",
        life: 3000,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl" // Cambiar el tamaño del modal a extra grande
      sx={{
        "& .MuiDialog-paper": {
          width: "90%", // Hacer que el modal ocupe el 90% del ancho
          height: "90vh", // Hacer que el modal ocupe el 90% de la altura
        },
      }}
    >
      <Toast ref={toastRef} />
      <DialogTitle>Exportar Datos</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          gap: "2rem",
          flexDirection: "row",
          maxHeight: "85vh", // Ajustar la altura para la vista previa
          overflowY: "hidden",
        }}
      >
        {/* Selección de columnas y formato */}
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
          <Typography variant="h6" sx={{ marginTop: "1rem" }}>
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
        </div>

        {/* Vista previa ajustada */}
        <TableContainer
          sx={{
            flex: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflowY: "auto", // Scroll vertical
            maxHeight: "75vh", // Ajustar altura para que la tabla sea más visible
            backgroundColor: "#f9f9f9",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              marginBottom: "1rem",
              color: "#9b1d1d",
              fontWeight: "bold",
            }}
          >
            Vista Previa
          </Typography>
          <Table
            stickyHeader
            sx={{
              "& th, & td": {
                textAlign: "left",
                whiteSpace: "normal",
              },
            }}
          >
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
                    }}
                  >
                    {columns.find((col) => col.accessor === accessor)?.label || accessor}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedRows.length > 0 ? (
                selectedRows.map((row, index) => (
                  <TableRow key={index}>
                    {selectedColumns.map((accessor) => (
                      <TableCell
                        key={accessor}
                        sx={{
                          textAlign: "left",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {row[accessor] || "Sin contenido"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={selectedColumns.length}
                    align="center"
                    sx={{ padding: "1rem" }}
                  >
                    No hay datos seleccionados para exportar.
                  </TableCell>
                </TableRow>
              )}
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

export default ExportModal;
