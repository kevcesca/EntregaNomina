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
import ExportModal from '../ReusableTableDetallesBitacora/components/ExportModal';
import API_BASE_URL from '../../%Config/apiConfig';
import { Toast } from 'primereact/toast';
import styles from './ReusableTableDetallesBitacora.module.css';

const columns = [
    { label: 'ID Empleado', accessor: 'ID Empleado' },
    { label: 'Nombre', accessor: 'Nombre' },
    { label: 'Apellido Paterno', accessor: 'Apellido 1' },
    { label: 'Campo Modificado', accessor: 'Campo Modificado' },
    { label: 'Valor Inicial', accessor: 'Valor Inicial' },
    { label: 'Valor Final', accessor: 'Valor Final' },
    { label: 'Año', accessor: 'Año' },
    { label: 'Quincena', accessor: 'Quincena' },
    { label: 'Nombre Nómina', accessor: 'Nombre Nómina' },
];

export default function ReusableTableDetallesBitacora({ anio, quincena, tipoNomina }) {
    const toastRef = useRef(null);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // 🚀 Cargar datos desde el API cuando cambian los filtros
    useEffect(() => {
        const fetchData = async () => {
            if (!anio || !quincena || !tipoNomina) return;

            setIsLoading(true);
            try {
                const url = `${API_BASE_URL}/consultaDetallesBitacora?anio=${anio}&quincena=${quincena}&tipoNomina=${tipoNomina}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Error al obtener los datos del API.');

                const result = await response.json();
                setData(result);
                setFilteredData(result);
                setSelectedRows([]); // 🔴 Limpiar selección al cambiar filtros
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
    }, [anio, quincena, tipoNomina]); // 🔴 Se ejecuta cuando cambian los filtros

    // 🚀 Limpiar selección si se borra el texto de búsqueda
    useEffect(() => {
        const filtered = data.filter((row) =>
            columns.some((col) =>
                String(row[col.accessor] || '').toLowerCase().includes(searchQuery.toLowerCase())
            )
        );

        setFilteredData(filtered);

        // 🔴 Si la barra de búsqueda está vacía, limpiar selección
        if (searchQuery === '') {
            setSelectedRows([]);
        }
    }, [searchQuery, data]); // 🔴 Se ejecuta cuando cambia `searchQuery`


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

    const handleSelectRow = (row) => {
        setSelectedRows((prev) => {
            // Si la fila ya está seleccionada, la quitamos
            if (prev.includes(row)) {
                return prev.filter((selectedRow) => selectedRow !== row);
            }
            // Si no está seleccionada, la agregamos
            return [...prev, row];
        });
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
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={
                                        selectedRows.length > 0 &&
                                        selectedRows.some((row) =>
                                            filteredData
                                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                .includes(row)
                                        )
                                    }
                                    checked={filteredData
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .every((row) => selectedRows.includes(row))}
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
                                .map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedRows.includes(row)}
                                                onChange={() => handleSelectRow(row)}
                                            />
                                        </TableCell>
                                        {columns.map((col) => (
                                            <TableCell key={col.accessor}>
                                                {row[col.accessor] || '-'}
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
