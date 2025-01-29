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
            if (!endpoint || !anio || !quincena) {
                console.warn("❌ Faltan parámetros para hacer la consulta.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                console.log(`🔍 Consultando: ${API_BASE_URL}/${endpoint} con Año: ${anio}, Quincena: ${quincena}`);

                const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
                    params: {
                        anio,
                        quincena,
                        cancelado: false,
                        completado: true,
                    },
                });

                if (!response.data || response.data.length === 0) {
                    console.warn("⚠ No se recibieron datos desde la API.");
                    setData([]);
                    setFilteredData([]);
                } else {
                    console.log("✅ Datos recibidos:", response.data);

                    // Limpieza y formateo de datos
                    const cleanData = response.data.map((row) => ({
                        ...row,
                        ANIO: row.ANIO?.trim() || "",
                        QUINCENA: row.QUINCENA?.trim() || "",
                        nomina: row.nomina?.trim() || "",
                        banco: row.banco?.trim() || "",
                        PERCEPCIONES: parseFloat(row.PERCEPCIONES?.replace(/,/g, "") || 0),
                        DEDUCCIONES: parseFloat(row.DEDUCCIONES?.replace(/,/g, "") || 0),
                        LIQUIDO: parseFloat(row.LIQUIDO?.replace(/,/g, "") || 0),
                        empleados: parseInt(row.empleados?.trim() || "0", 10),
                    }));

                    setData(cleanData);
                    setFilteredData(cleanData);
                }
            } catch (error) {
                console.error("❌ Error al obtener los datos:", error);
                toastRef.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: "No se pudieron cargar los datos. Intenta de nuevo.",
                    life: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [endpoint, anio, quincena]);



    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredData(data); // Si no hay búsqueda, muestra todos los datos
            setSelectedRows([]); // 🔴 Se deseleccionan todas las filas cuando se borra la búsqueda
        } else {
            setFilteredData(data.filter(row =>
                columns.some(col =>
                    String(row[col.accessor] || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
            ));
            setSelectedRows([]); // 🔴 Se deseleccionan todas las filas cuando se hace una nueva búsqueda
        }
    }, [searchQuery, data]);
    
    


    const handleSelectRow = (row) => {
        setSelectedRows((prev) => {
            const rowKey = `${row.ANIO}-${row.nomina}-${row.banco}`; // Clave única para identificar filas
            const isSelected = prev.some((r) => `${r.ANIO}-${r.nomina}-${r.banco}` === rowKey);

            if (isSelected) {
                return prev.filter((r) => `${r.ANIO}-${r.nomina}-${r.banco}` !== rowKey);
            } else {
                return [...prev, row];
            }
        });
    };


    const handleSelectAll = (checked) => {
        const visibleRows = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

        if (checked) {
            setSelectedRows((prev) => {
                const updatedSelection = [...prev];

                visibleRows.forEach((row) => {
                    const rowKey = `${row.ANIO}-${row.nomina}-${row.banco}`;
                    if (!prev.some((r) => `${r.ANIO}-${r.nomina}-${r.banco}` === rowKey)) {
                        updatedSelection.push(row);
                    }
                });

                return updatedSelection;
            });
        } else {
            setSelectedRows((prev) =>
                prev.filter((row) => !visibleRows.some((r) => `${r.ANIO}-${r.nomina}-${r.banco}` === `${row.ANIO}-${row.nomina}-${row.banco}`))
            );
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
                                    <TableRow key={`${row.ANIO}-${row.nomina}-${row.banco}-${row.QUINCENA}`}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedRows.some((r) => `${r.ANIO}-${r.nomina}-${r.banco}` === `${row.ANIO}-${row.nomina}-${row.banco}`)}
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
                selectedRows={selectedRows}  // ✅ Pasa los datos correctos
                columns={columns}            // ✅ Pasa las columnas correctas
            />

        </Paper>
    );
}
