import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import * as Papa from "papaparse";
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
  ThemeProvider,
} from "@mui/material";
import { Toast } from "primereact/toast";
import styles from "../ReusableTableDepositoResumen.module.css";
import theme from "../../../$tema/theme";

const ExportModal = ({ open, onClose, selectedRows, columns, extraData }) => {
  const [selectedColumns, setSelectedColumns] = useState(
    columns.map((col) => col.accessor)
  );
  const [exportFormat, setExportFormat] = useState("");
  const toastRef = useRef(null);

  // Un toggler para agregar/quitar columnas
  const handleColumnToggle = (accessor) => {
    setSelectedColumns((prev) =>
      prev.includes(accessor)
        ? prev.filter((col) => col !== accessor)
        : [...prev, accessor]
    );
  };

  // 1) Transformar "selectedRows" (+ extraData) a un arreglo "exportData"
  //    que será la fuente única para PDF, Excel y CSV.
  const getExportData = () => {
    // Copiamos las filas seleccionadas
    let exportData = [...selectedRows];
    // Si hay "extraData", lo agregamos al final
    if (extraData != null) {
      exportData.push(extraData);
    }
    return exportData;
  };

  // 2) Aplica la lógica de obtener el valor de cada celda,
  //    incluyendo formateo para PERCEPCIONES, DEDUCCIONES, LIQUIDO, etc.
  //    Así la vista previa y la exportación final se mantienen consistentes.
  const getCellValue = (row, accessor) => {
    const rawValue = row[accessor] ?? "-";

    // Si deseas formatear sólo en CSV, podrías condicionar,
    // pero aquí lo haremos de forma unificada:
    if (
      accessor === "PERCEPCIONES" ||
      accessor === "DEDUCCIONES" ||
      accessor === "LIQUIDO"
    ) {
      // Formato moneda
      if (typeof rawValue === "number") {
        return rawValue.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
      }
    }
    // Si no entra al if, devuelves el valor tal cual
    return rawValue;
  };

  const handleExport = () => {
    // Asegura que haya columnas seleccionadas
    if (selectedColumns.length === 0) {
      toastRef.current.show({
        severity: "warn",
        summary: "Advertencia",
        detail: "Selecciona al menos una columna para exportar.",
        life: 3000,
      });
      return;
    }

    const exportData = getExportData();
    // Ojo: si exportData está vacío, no se exporta nada
    // (pero asumo que ya controlas que haya filas antes de abrir el modal)

    // 3) Dependiendo del formato:
    switch (exportFormat) {
      case "pdf": {
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        doc.setFontSize(16);
        doc.text("Exportación de Datos", 14, 15);

        // Encabezados
        const tableColumnHeaders = selectedColumns.map(
          (accessor) =>
            columns.find((col) => col.accessor === accessor)?.label || accessor
        );

        // Filas
        const tableRows = exportData.map((row) =>
          selectedColumns.map((accessor) => getCellValue(row, accessor))
        );

        doc.autoTable({
          head: [tableColumnHeaders],
          body: tableRows,
          startY: 25,
          styles: { halign: "center", fontSize: 9, cellPadding: 3 },
          headStyles: {
            fillColor: [155, 29, 29],
            textColor: [255, 255, 255],
            fontSize: 11,
          },
          bodyStyles: {
            valign: "middle",
            halign: "center",
            overflow: "linebreak",
          },
          margin: { top: 25 },
          tableWidth: "auto",
        });

        doc.save("exportacion.pdf");
        break;
      }

      case "excel": {
        // Cabeceras (Primera fila)
        const sheetHeader = selectedColumns.map(
          (accessor) =>
            columns.find((col) => col.accessor === accessor)?.label || accessor
        );

        // Cuerpo
        const sheetBody = exportData.map((row) =>
          selectedColumns.map((accessor) => getCellValue(row, accessor))
        );

        // Combinar cabeceras y cuerpo
        const worksheetData = [sheetHeader, ...sheetBody];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
        XLSX.writeFile(workbook, "exportacion.xlsx");
        break;
      }

      case "csv": {
        // Armamos un array que al final pasamos a Papa.unparse
        //  - 1) Fila de encabezados
        //  - 2) Filas
        const csvHeader = selectedColumns.map(
          (accessor) =>
            columns.find((col) => col.accessor === accessor)?.label || accessor
        );

        const csvBody = exportData.map((row) =>
          selectedColumns.map((accessor) => getCellValue(row, accessor))
        );

        const csvMatrix = [csvHeader, ...csvBody];
        const csvString = Papa.unparse(csvMatrix);

        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "exportacion.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      }

      default:
        toastRef.current.show({
          severity: "warn",
          summary: "Advertencia",
          detail: "Selecciona un formato válido para exportar.",
          life: 3000,
        });
    }
  };

  // Vista previa: se basa en selectedRows (sin formateo especial) 
  // o, si quieres, podrías usar la misma "getCellValue" para que sea exactamente igual
  // al resultado final.
  const previewRows = selectedRows; // la vista previa se hace con las filas "tal cual"

  return (
    <ThemeProvider theme={theme}>
      <Toast ref={toastRef} />
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
        sx={{
          "& .MuiDialog-paper": {
            height: "80vh",
            maxWidth: "90%",
            padding: "16px",
          },
        }}
      >
        <DialogTitle>Exportar Datos</DialogTitle>
        <DialogContent
          className={styles.dialogContent}
          sx={{ display: "flex", flexDirection: "row", gap: "1.5rem" }}
        >
          {/* Selección de formato y columnas */}
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
              maxHeight: "70vh",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "0.5rem",
            }}
          >
            <Typography
              variant="h6"
              sx={{ marginBottom: "1rem", textAlign: "center", color: "#9b1d1d" }}
            >
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
                      {
                        columns.find((col) => col.accessor === accessor)
                          ?.label || accessor
                      }
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {previewRows.map((row, index) => (
                  <TableRow key={index}>
                    {selectedColumns.map((accessor) => (
                      <TableCell key={accessor}>
                        {row[accessor] ?? "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                {extraData && (
                  <TableRow>
                    {selectedColumns.map((accessor) => (
                      <TableCell key={accessor} sx={{ fontWeight: "bold" }}>
                        {extraData[accessor] || "-"}
                      </TableCell>
                    ))}
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
          <Button
            onClick={handleExport}
            variant="contained"
            color="primary"
            disabled={!exportFormat || selectedColumns.length === 0}
          >
            Exportar
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default ExportModal;
