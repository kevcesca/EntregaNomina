'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Checkbox,
    TextField,
    InputAdornment,
    TablePagination,
    Paper,
    Button,
    Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExportModal from '../ReusableTableDepositoResumen/components/ExportModal';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import styles from "../ReusableTableDepositoResumen/ReusableTableDepositoResumen.module.css";
import API_BASE_URL from '../../%Config/apiConfig';

const columns = [
    { label: 'Sector Presupuestal', accessor: 'sectpres' },
    { label: 'Nómina', accessor: 'nomina' },
    { label: 'ID Concepto', accessor: 'id_concepto1' }, // ✅ CORREGIDO
    { label: 'Nombre Concepto', accessor: 'nombre_concepto' },
    { label: 'Deducciones', accessor: 'deducciones' },
];

export default function DeduccionesTabla({ anio, quincena, nombreNomina }) {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const toastRef = useRef(null);
    const [extraExportData, setExtraExportData] = useState(null);

    useEffect(() => {
        if (anio && quincena && nombreNomina) {
            fetchData();
        }
    }, [anio, quincena, nombreNomina]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/NominaCtrl/DeduccionesSeparadas`, {
                params: { anio, quincena, nombre: nombreNomina, cancelado: false, completado: true },
            });

            const cleanData = response.data.map((row) => ({
                ...row,
                deducciones: parseFloat(row.deducciones?.replace(/,/g, '').trim() || 0),
            }));

            setData(cleanData);
            setFilteredData(cleanData);
        } catch (error) {
            toastRef.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un problema al obtener los datos.',
                life: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredData(data);
        } else {
            setFilteredData(
                data.filter(row =>
                    columns.some(col =>
                        String(row[col.accessor] || '').toLowerCase().includes(searchQuery.toLowerCase())
                    )
                )
            );
        }
        setPage(0);
        setSelectedRows([]);
    }, [searchQuery, data]);

    const handleSelectRow = (row) => {
        setSelectedRows((prev) => {
            const rowKey = `${row.sectpres}-${row.nomina}-${row.id_concepto1}`;
            const isSelected = prev.some((r) => `${r.sectpres}-${r.nomina}-${r.id_concepto1}` === rowKey);

            if (isSelected) {
                return prev.filter((r) => `${r.sectpres}-${r.nomina}-${r.id_concepto1}` !== rowKey);
            } else {
                return [...prev, row];
            }
        });
    };


    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRows(filteredData); // Selecciona todas las filas filtradas
        } else {
            setSelectedRows([]);
        }
    };


    const handleExportModalOpen = () => {
        if (selectedRows.length === 0) {
            toastRef.current.show({
                severity: "warn",
                summary: "Advertencia",
                detail: "Selecciona al menos una fila para exportar.",
                life: 3000,
            });
            return;
        }

        const extraData = selectedRows.length === filteredData.length
            ? { sectpres: "TOTAL", nomina: "", id_concepto1: "", nombre_concepto: "TOTAL DEDUCCIONES", deducciones: totalDeducciones }
            : null;

        setExtraExportData(extraData);
        setIsExportModalOpen(true);
    };


    const totalDeducciones = filteredData.reduce((sum, row) => sum + (row.deducciones || 0), 0);

    return (
        <Paper className={styles.container}>
            <Toast ref={toastRef} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: '1rem' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ backgroundColor: 'white', borderRadius: '8px' }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleExportModalOpen}
                    disabled={selectedRows.length === 0}
                >
                    Exportar
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {/* ✅ Checkbox con fondo blanco fuera del fondo rojo */}
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                                    checked={selectedRows.length === filteredData.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </TableCell>

                            {columns.map((col) => (
                                <TableCell key={col.accessor} sx={{ backgroundColor: '#9b1d1d', color: 'white', fontWeight: 'bold' }}>
                                    {col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} align="center">
                                    Cargando...
                                </TableCell>
                            </TableRow>
                        ) : filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} align="center">
                                    No hay datos
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                <TableRow key={`${row.sectpres}-${row.nomina}-${row.id_concepto1}`}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedRows.some((r) => `${r.sectpres}-${r.nomina}-${r.id_concepto1}` === `${row.sectpres}-${row.nomina}-${row.id_concepto1}`)}
                                            onChange={() => handleSelectRow(row)}
                                        />
                                    </TableCell>

                                    {columns.map((col) => (
                                        <TableCell key={col.accessor}>
                                            {col.accessor === 'deducciones'
                                                ? row[col.accessor].toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                                                : row[col.accessor]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <div style={{ padding: '1rem', textAlign: 'left' }}>
                <h3>Total Deducciones: {totalDeducciones.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h3>
            </div>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />



            <ExportModal open={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} selectedRows={selectedRows} columns={columns} extraData={extraExportData} />
        </Paper>
    );
}
