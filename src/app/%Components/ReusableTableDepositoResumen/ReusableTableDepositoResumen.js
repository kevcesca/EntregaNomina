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
import { useRouter } from 'next/navigation';
import styles from './ReusableTableDepositoResumen.module.css';
import API_BASE_URL from '../../%Config/apiConfig';
import { Toast } from 'primereact/toast';

const columns = [
    { label: 'AÑO', accessor: 'ANIO' },
    { label: 'QUINCENA', accessor: 'QUINCENA' },
    { label: 'NÓMINA', accessor: 'nomina' },
    { label: 'BANCO', accessor: 'banco' },
    { label: 'BRUTO', accessor: 'PERCEPCIONES' },
    { label: 'DEDUCCIONES', accessor: 'DEDUCCIONES' },
    { label: 'NETO', accessor: 'LIQUIDO' },
    { label: 'EMPLEADOS', accessor: 'empleados' },
];

export default function ReusableTableDepositoResumen({ endpoint, anio, quincena, onRowClick }) {
    const router = useRouter();
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
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const url = `${API_BASE_URL}/${endpoint}`;
                const response = await axios.get(url, {
                    params: {
                        anio, // Usamos el año seleccionado
                        quincena, // Usamos la quincena seleccionada
                        cancelado: false,
                        completado: true,
                    },
                });
    
                const cleanData = response.data.map((row) => ({
                    ...row,
                    ANIO: row.ANIO.trim(),
                    QUINCENA: row.QUINCENA.trim(),
                    nomina: row.nomina.trim(),
                    banco: row.banco.trim(),
                    PERCEPCIONES: parseFloat(row.PERCEPCIONES.replace(/,/g, '')),
                    DEDUCCIONES: parseFloat(row.DEDUCCIONES.replace(/,/g, '')),
                    LIQUIDO: parseFloat(row.LIQUIDO.replace(/,/g, '')),
                    empleados: parseInt(row.empleados.trim(), 10),
                }));
    
                setData(cleanData);
                setFilteredData(cleanData);
            } catch (error) {
                console.error('Error al cargar los datos:', error);
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
    
        fetchData();
    }, [endpoint, anio, quincena]); // <-- Agrega anio y quincena como dependencias
    

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

    const handleEmpleadosClick = (row) => {
        const { ANIO, QUINCENA, nomina, banco } = row;
        router.push(
            `/CrearNomina/ProcesarDatos/DetalleEmpleados?anio=${ANIO}&quincena=${QUINCENA}&nomina=${nomina}&banco=${banco}`
        );
    };

    return (
        <Paper className={styles.container}>
            <Toast ref={toastRef} />
            {/* Barra de búsqueda */}
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
                    sx={{
                        backgroundColor: '#9b1d1d',
                        '&:hover': { backgroundColor: '#7b1616' },
                    }}
                >
                    Exportar
                </Button>
            </Box>

            {/* Tabla */}
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" className={styles.headerCheckbox}>
                                <Checkbox
                                    indeterminate={
                                        selectedRows.length > 0 &&
                                        selectedRows.some((row) =>
                                            filteredData
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .includes(row)
                                        )
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
                                <TableCell key={col.accessor} className={styles.tableHeader}>
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
                            filteredData
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <TableRow key={row.ANIO + row.nomina}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedRows.includes(row)}
                                                onChange={() => handleSelectRow(row)}
                                            />
                                        </TableCell>
                                        {columns.map((col) => (
                                            <TableCell key={col.accessor}>
                                                {col.accessor === 'empleados' ? (
                                                    <span
                                                        style={{
                                                            color: 'blue',
                                                            textDecoration: 'underline',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() => handleEmpleadosClick(row)}
                                                    >
                                                        {row[col.accessor]}
                                                    </span>
                                                ) : col.accessor === 'PERCEPCIONES' ||
                                                    col.accessor === 'DEDUCCIONES' ||
                                                    col.accessor === 'LIQUIDO' ? (
                                                    row[col.accessor].toLocaleString('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    })
                                                ) : (
                                                    row[col.accessor] || '-'
                                                )}
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
                rowsPerPageOptions={[5, 10, 25]}
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) =>
                    setRowsPerPage(parseInt(e.target.value, 10))
                }
            />

            {/* Modal de exportación */}
            <ExportModal
                open={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                selectedRows={selectedRows}
                columns={columns}
            />
        </Paper>
    );
}
