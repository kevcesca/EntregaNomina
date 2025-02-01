'use client';

import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import API_BASE_URL from '../../%Config/apiConfig';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import { Button } from '@mui/material';
import ExportTableModalHonorarios from './%Components/ExportTableModalHonorarios';


export default function HonorariosTable() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]); // Estado para filas seleccionadas

    const availableColumns = [
        { key: 'id', label: 'ID' },
        { key: 'identificador', label: 'Identificador' },
        { key: 'unidad_administrativa', label: 'Unidad Administrativa' },
        { key: 'subprograma', label: 'Subprograma' },
        { key: 'nombre_empleado', label: 'Nombre Empleado' },
        { key: 'nombre_puesto', label: 'Nombre Puesto' },
        { key: 'folio', label: 'Folio' },
        { key: 'fecha_pago', label: 'Fecha de Pago' },
        { key: 'percepciones', label: 'Percepciones' },
        { key: 'deducciones', label: 'Deducciones' },
        { key: 'liquido', label: 'Líquido' },
        { key: 'forma_de_pago', label: 'Forma de Pago' },
    ];

    const [visibleColumns, setVisibleColumns] = useState(availableColumns.map(col => col.key));

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/NominaCtrl/Honorarios/Consulta`);
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const json = await response.json();
            setData(json);
            setFilteredData(json);
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const [exportModalOpen, setExportModalOpen] = useState(false);


    const handleRowDoubleClick = (params) => {
        setSelectedEmployee(params.row);
        setIsModalOpen(true);
    };

    const handleFilterChange = (event) => {
        const value = event.target.value.toLowerCase();
        setGlobalFilter(value);
        setFilteredData(data.filter(row => Object.values(row).some(val => val?.toString().toLowerCase().includes(value))));
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" padding="20px" sx={{ boxShadow: 3, borderRadius: 4 }}>
            <TextField label="Buscar" variant="outlined" fullWidth value={globalFilter} onChange={handleFilterChange} style={{ marginBottom: '20px', maxWidth: '1200px' }} />

            <Box height="calc(115vh - 200px)" width="100%" maxWidth="1300px" style={{ overflowX: 'auto' }}>
                <DataGrid
                    rows={filteredData}
                    columns={availableColumns.map(col => ({ field: col.key, headerName: col.label, flex: 1, minWidth: 150 }))}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    getRowId={(row) => row.id}
                    onRowDoubleClick={handleRowDoubleClick}
                    checkboxSelection // Agrega checkboxes al inicio de cada fila
                    onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)} // Maneja las selecciones
                    disableColumnMenu
                    disableColumnFilter
                    disableColumnSorting
                />
            </Box>
            <br></br>
            <Button variant="contained" color="primary" onClick={() => setExportModalOpen(true)} style={{ marginBottom: '10px' }}>
                Exportar Datos
            </Button>
            <EmployeeDetailsModal open={isModalOpen} onClose={() => setIsModalOpen(false)} employeeData={selectedEmployee} />
            <ExportTableModalHonorarios
    open={exportModalOpen}
    onClose={() => setExportModalOpen(false)}
    rows={filteredData.filter(row => selectedRows.includes(row.id))} // Solo filas seleccionadas
    columns={availableColumns.filter(col => visibleColumns.includes(col.key))} // Solo columnas visibles
/>

        </Box>
    );
}
