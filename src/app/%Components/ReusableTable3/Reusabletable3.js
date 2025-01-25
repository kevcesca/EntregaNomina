"use client";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Checkbox,
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
  Paper,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  TablePagination,
  Box,
  FormControlLabel,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import styles from "./ReusableTable3.module.css";

const ReusableTable3 = ({ columns, fetchData, data: externalData, loading }) => {
  const [data, setData] = useState([]); // Datos internos
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState(columns.map((col) => col.accessor));
  const [exportFormat, setExportFormat] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0); // Página actual
  const [rowsPerPage, setRowsPerPage] = useState(5); // Registros por página

  // Cargar datos: usa externalData o fetchData
  useEffect(() => {
    if (externalData) {
      setData(externalData);
    } else if (fetchData) {
      handleFetchData();
    }
  }, [externalData, fetchData]);

  const handleFetchData = async () => {
    if (!fetchData) return;
    try {
      const fetchedData = await fetchData();
      setData(fetchedData || []);
      setSelectedRows([]);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  };

  // Selección de filas
  const handleRowSelect = (row) => {
    setSelectedRows((prev) =>
      prev.includes(row)
        ? prev.filter((selectedRow) => selectedRow !== row)
        : [...prev, row]
    );
  };

  const handleSelectAll = (event) => {
    setSelectedRows(event.target.checked ? data : []);
  };

  // Cambio de columnas visibles
  const handleColumnToggle = (accessor) => {
    setSelectedColumns((prev) =>
      prev.includes(accessor)
        ? prev.filter((col) => col !== accessor)
        : [...prev, accessor]
    );
  };

  // Filtrar datos
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredData = data.filter((row) =>
    columns.some((col) =>
      (row[col.accessor] || "").toString().toLowerCase().includes(searchQuery)
    )
  );

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reiniciar a la primera página
  };

  // Exportar datos
  const handleExport = () => {
    const filteredData = selectedRows.map((row) =>
      selectedColumns.reduce((acc, accessor) => {
        acc[accessor] = row[accessor] || "null";
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

  const exportToCSV = (filteredData) => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "export.csv");
  };

  const exportToExcel = (filteredData) => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "export.xlsx");
  };

  const exportToPDF = (filteredData) => {
    const doc = new jsPDF();
    const tableColumns = selectedColumns.map((accessor) =>
      columns.find((col) => col.accessor === accessor)?.label || accessor
    );
    const tableData = filteredData.map((row) =>
      selectedColumns.map((accessor) => row[accessor] || "null")
    );

    autoTable(doc, {
      head: [tableColumns],
      body: tableData,
      headStyles: { fillColor: [155, 29, 29] },
    });
    doc.save("export.pdf");
  };

  return (
    <Paper className={styles.tableContainer}>
      <Typography variant="h5" className={styles.title}>
        Lista de Cambios Realizados
      </Typography>
      <Box className={styles.toolbar}>
        <TextField
          placeholder="Buscar..."
          value={searchQuery}
          onChange={handleSearch}
          variant="outlined"
          size="small"
          className={styles.searchBar}
        />
        <Tooltip title="Actualizar datos">
          <IconButton onClick={handleFetchData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
          disabled={selectedRows.length === 0}
        >
          Exportar
        </Button>
      </Box>

      {/* Tabla principal dentro de un contenedor scrollable */}
      <TableContainer className={styles.scrollableTable}>
        <Table>
          <TableHead className={styles.tableHead}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                  checked={selectedRows.length === filteredData.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column.accessor || column.label} className={styles.headerCell}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  selected={selectedRows.includes(row)}
                  onClick={() => handleRowSelect(row)}
                  className={selectedRows.includes(row) ? styles.selectedRow : ""}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedRows.includes(row)} />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.accessor || column.label}>
                      {column.body ? column.body(row) : row[column.accessor] || "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      <TablePagination
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página"
        rowsPerPageOptions={[5, 10, 15, 20]}
      />

      {/* Modal de exportación */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="lg">
        <DialogTitle>Exportar Datos</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2}>
            {/* Filtros (Izquierda) */}
            <Box flex={1} className={styles.filtersContainer}>
              <FormControl fullWidth className={styles.formatSelector}>
                <InputLabel>Formato de Exportación</InputLabel>
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

              <Box className={styles.columnsSelector}>
                <Typography variant="h6" className={styles.columnsSelectorTitle}>
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
            </Box>

            {/* Vista Previa (Derecha) */}
            <Box flex={2} className={styles.previewContainer}>
              <Typography variant="h6" className={styles.previewTitle}>
                Vista Previa
              </Typography>
              <TableContainer className={styles.previewTable}>
                <Table>
                  <TableHead className={styles.tableHead}>
                    <TableRow>
                      {selectedColumns.map((accessor) => (
                        <TableCell className={styles.headerCell} key={accessor}>
                          {columns.find((col) => col.accessor === accessor)?.label || accessor}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={selectedColumns.length} align="center">
                          No hay registros seleccionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedRows.map((row, index) => (
                        <TableRow key={index}>
                          {selectedColumns.map((accessor) => (
                            <TableCell key={accessor}>{row[accessor]}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            color="primary"
            disabled={!exportFormat || selectedColumns.length === 0}
          >
            Exportar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

ReusableTable3.propTypes = {
  columns: PropTypes.array.isRequired,
  fetchData: PropTypes.func,
  data: PropTypes.array,
  loading: PropTypes.bool,
};

export default ReusableTable3;
