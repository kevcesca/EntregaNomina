import React, { useState } from "react";
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
import * as Papa from "papaparse";
import styles from "../ReusableTable.module.css";
import theme from "../../../$tema/theme";
 
const ExportModal = ({ open, onClose, selectedRows, columns }) => {
  const [selectedColumns, setSelectedColumns] = useState(columns.map((col) => col.accessor));
  const [exportFormat, setExportFormat] = useState("");
  const isExportDisabled = !exportFormat || selectedColumns.length === 0; // Validación

  const handleColumnToggle = (accessor) => {
    setSelectedColumns((prev) =>
      prev.includes(accessor) ? prev.filter((col) => col !== accessor) : [...prev, accessor]
    );
  };

  const handleExport = () => {
    if (!exportFormat) {
      alert("Selecciona un formato válido para exportar.");
      return;
    }

    const filteredData = selectedRows.map((row) =>
      selectedColumns.reduce((acc, accessor) => {
        acc[accessor] = row[accessor] || "-";
        return acc;
      }, {})
    );

    switch (exportFormat) {
      case "pdf":
        const doc = new jsPDF();
        const tableColumns = selectedColumns.map(
          (accessor) => columns.find((col) => col.accessor === accessor)?.label || accessor
        );
        const tableData = filteredData.map((row) => selectedColumns.map((accessor) => row[accessor]));

        autoTable(doc, {
          head: [tableColumns],
          body: tableData,
          margin: { top: 20 },
          headStyles: {
            fillColor: [155, 29, 29],
            textColor: "#ffffff",
          },
        });

        doc.save("export.pdf");
        break;

      case "excel":
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, "export.xlsx");
        break;

      case "csv":
        const csvData = Papa.unparse(filteredData);
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "export.csv";
        link.click();
        break;

      default:
        break;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
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
          {/* Columna de opciones */}
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
            <h3 style={{ textAlign: "center", fontWeight: "bold" }}>Vista Previa</h3>
            <Table>
              <TableHead>
                <TableRow>
                  {selectedColumns.map((accessor) => (
                    <TableCell
                      key={accessor}
                      sx={{
                        backgroundColor: "#9b1d1d",
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      {columns.find((col) => col.accessor === accessor)?.label || accessor}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined" color="error">
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            color="primary"
            disabled={isExportDisabled}
          >
            Exportar
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default ExportModal;
