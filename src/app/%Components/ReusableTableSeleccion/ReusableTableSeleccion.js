"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Checkbox,
    TableBody,
    TablePagination,
    TextField,
    InputAdornment,
    Button,
    Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Toast } from "primereact/toast";
import styles from './ReusableTableDepositoResumen.module.css';

// Tu modal de exportación, ajústalo a tu ruta real
import ExportModal from "./components/ExportModal";

export default function ReusableTable({ columns = [], fetchData }) {
    const toastRef = useRef(null);

    // Estados de la tabla
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);

    // Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Loading/error (opcional)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Control del modal de exportación
    const [isExportModalOpen, setExportModalOpen] = useState(false);

    // 1) Cargar datos vía fetchData() cuando cambie la referencia de fetchData
    useEffect(() => {
        if (!fetchData) return;
        let isMounted = true;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await fetchData();
                if (isMounted && Array.isArray(result)) {
                    // Generar un ID para cada fila de forma genérica
                    const dataConId = result.map((item, index) => ({
                        ...item,
                        // Podrías usar un uuid, o concatenar algo con index, por ejemplo:
                        __rowId: `auto-${index}-${Date.now()}`,
                    }));

                    setData(dataConId);
                    setFilteredData(dataConId);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || "Error al obtener datos");
                }
                console.error("fetchData error:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadData();
        return () => {
            isMounted = false;
        };
    }, [fetchData]);

    // 2) Filtrado local por searchQuery
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredData(data);
            setSelectedRows([]);
        } else {
            const q = searchQuery.toLowerCase();
            const filtered = data.filter((row) =>
                columns.some((col) =>
                    String(row[col.accessor] ?? "").toLowerCase().includes(q)
                )
            );
            setFilteredData(filtered);
            setSelectedRows([]);
        }
    }, [searchQuery, data, columns]);

    // 3) Seleccionar fila individual
    const handleSelectRow = (row) => {
        setSelectedRows((prev) => {
            const key = row.__rowId;       // <--- Usamos __rowId
            const isSelected = prev.some((item) => item.__rowId === key);
            return isSelected
                ? prev.filter((item) => item.__rowId !== key)
                : [...prev, row];
        });
    };

    // 4) Seleccionar/deseleccionar todas las filas en la página actual
    const handleSelectAll = (checked) => {
        const visible = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

        if (checked) {
            setSelectedRows((prev) => {
                const newSelection = [...prev];
                visible.forEach((row) => {
                    if (!newSelection.some((item) => item.__rowId === row.__rowId)) {
                        newSelection.push(row);
                    }
                });
                return newSelection;
            });
        } else {
            setSelectedRows((prev) =>
                prev.filter((sel) => !visible.some((r) => r.__rowId === sel.__rowId))
            );
        }
    };


    // 5) Botón Exportar
    const handleExportModalOpen = () => {
        if (selectedRows.length === 0) {
            toastRef.current?.show({
                severity: "warn",
                summary: "Advertencia",
                detail: "Selecciona al menos una fila para exportar.",
                life: 3000,
            });
            return;
        }
        setExportModalOpen(true);
    };
    const handleExportModalClose = () => {
        setExportModalOpen(false);
    };

    // Paginación
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    // Filas visibles
    const visibleRows = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Determinar si el checkbox de header está “indeterminate” o “checked”
    const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedRows.includes(row));
    const someVisibleSelected = visibleRows.some((row) => selectedRows.includes(row));

    return (
        <Paper sx={{ position: "relative", padding: 1 }}>
            <Toast ref={toastRef} />

            {/* Mensaje de error o de carga */}
            {error && <div style={{ color: "red" }}>Error: {error}</div>}
            {isLoading && <div>Cargando datos...</div>}

            {/* Barra superior: búsqueda y botón exportar */}
            <Box sx={{ display: "flex", gap: 1, padding: 1 }}>
                <TextField
                    placeholder="Buscar..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    disabled={selectedRows.length === 0}
                    onClick={handleExportModalOpen}
                    sx={{ backgroundColor: "#9b1d1d", "&:hover": { backgroundColor: "#7b1616" } }}
                >
                    Exportar
                </Button>
            </Box>

            {/* Tabla */}
            <Table>
                {/* HEAD de la tabla */}
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox
                                indeterminate={someVisibleSelected && !allVisibleSelected}
                                checked={allVisibleSelected}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                        </TableCell>
                        {columns.map((col) => (
                            <TableCell className={styles.tableHeader} key={col.accessor}>{col.label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>

                {/* BODY de la tabla */}
                <TableBody>
                    {!isLoading && filteredData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length + 1} align="center">
                                No hay datos
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => (
                                <TableRow key={row.__rowId}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedRows.some((sel) => sel.__rowId === row.__rowId)}
                                            onChange={() => handleSelectRow(row)}
                                        />
                                    </TableCell>
                                    {columns.map((col) => (
                                        <TableCell key={col.accessor}>
                                            {row[col.accessor] ?? "-"}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                    )}
                </TableBody>
            </Table>

            {/* Paginación */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Modal de exportación */}
            <ExportModal
                open={isExportModalOpen}
                onClose={handleExportModalClose}
                selectedRows={selectedRows}
                columns={columns}
            />
        </Paper>
    );
}