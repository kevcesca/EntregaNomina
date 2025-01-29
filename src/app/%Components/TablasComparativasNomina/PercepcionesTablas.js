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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';

const columns = [
    { label: 'Sector Presupuestal', accessor: 'sectpres' },
    { label: 'Nómina', accessor: 'nomina' },
    { label: 'ID Concepto', accessor: 'id_concepto' },
    { label: 'Nombre Concepto', accessor: 'nombre_concepto' },
    { label: 'Percepciones', accessor: 'percepciones' },
];

export default function PercepcionesTabla({ anio, quincena, nombreNomina, subTipo }) {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const toastRef = useRef(null);

    useEffect(() => {
        if (anio && quincena && nombreNomina) {
            fetchData();
        }
    }, [anio, quincena, nombreNomina, subTipo]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/NominaCtrl/PercepcionesSeparadas`, {
                params: {
                    anio,
                    quincena,
                    nombre: nombreNomina,
                    cancelado: false,
                    completado: true,
                },
            });

            const filtered = subTipo
                ? response.data.filter((item) => item.subTipo === subTipo)
                : response.data;

            const cleanData = filtered.map((row) => ({
                ...row,
                percepciones: parseFloat(row.percepciones?.replace(/,/g, '') || 0), // Inicializa en 0 si está vacío
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
        const filtered = data.filter((row) =>
            columns.some((col) =>
                String(row[col.accessor] || '').toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
        setFilteredData(filtered);
    }, [searchQuery, data]);

    const handleSelectRow = (row) => {
        setSelectedRows((prev) =>
            prev.includes(row) ? prev.filter((r) => r !== row) : [...prev, row]
        );
    };

    const handleSelectAll = (checked) => {
        const visibleRows = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
        if (checked) {
            const newSelection = [...selectedRows, ...visibleRows.filter((row) => !selectedRows.includes(row))];
            setSelectedRows(newSelection);
        } else {
            const newSelection = selectedRows.filter((row) => !visibleRows.includes(row));
            setSelectedRows(newSelection);
        }
    };

    const handleExportModalOpen = () => {
        if (selectedRows.length === 0) {
            toastRef.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Selecciona al menos una fila para exportar.',
                life: 3000,
            });
            return;
        }
        setIsExportModalOpen(true);
    };

    const handleExportExcel = () => {
        const worksheetData = selectedRows.map((row) => ({
            'Sector Presupuestal': row.sectpres,
            Nómina: row.nomina,
            'ID Concepto': row.id_concepto,
            'Nombre Concepto': row.nombre_concepto,
            Percepciones: row.percepciones.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `Percepciones_${anio}_${quincena}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const tableData = selectedRows.map((row) => [
            row.sectpres,
            row.nomina,
            row.id_concepto,
            row.nombre_concepto,
            row.percepciones.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        ]);

        autoTable(doc, {
            head: [['Sector Presupuestal', 'Nómina', 'ID Concepto', 'Nombre Concepto', 'Percepciones']],
            body: tableData,
        });

        doc.save(`Percepciones_${anio}_${quincena}.pdf`);
    };

    const totalPercepciones = data.reduce((sum, row) => sum + (row.percepciones || 0), 0);

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
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                    }}
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
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={
                                        selectedRows.length > 0 &&
                                        filteredData
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .some((row) => !selectedRows.includes(row))
                                    }
                                    checked={
                                        filteredData
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .every((row) => selectedRows.includes(row))
                                    }
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </TableCell>
                            {columns.map((col) => (
                                <TableCell key={col.accessor}>{col.label}</TableCell>
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
                            filteredData
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <TableRow key={row.id_concepto}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedRows.includes(row)}
                                                onChange={() => handleSelectRow(row)}
                                            />
                                        </TableCell>
                                        {columns.map((col) => (
                                            <TableCell key={col.accessor}>
                                                {col.accessor === 'percepciones'
                                                    ? (row[col.accessor] || 0).toLocaleString('en-US', {
                                                          style: 'currency',
                                                          currency: 'USD',
                                                      })
                                                    : row[col.accessor] || '-'}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />

            <div style={{ padding: '1rem', textAlign: 'right' }}>
                <strong>Total Percepciones:</strong> {totalPercepciones.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>

            <ExportModal
                open={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                selectedRows={selectedRows}
                columns={columns}
            />
        </Paper>
    );
}
