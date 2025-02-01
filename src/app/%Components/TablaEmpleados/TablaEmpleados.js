'use client';

import React, { useState, useEffect } from 'react';
import { TextField, Box, Button, } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import API_BASE_URL from '../../%Config/apiConfig';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import ExportTableModal from './%Components/ExportTableModal';


export default function EmpleadosTable() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const columns = [
        { field: 'id_empleado', headerName: 'ID Empleado', flex: 1, minWidth: 120 },
        { field: 'nombre', headerName: 'Nombre', flex: 1, minWidth: 150 },
        { field: 'apellido_1', headerName: 'Apellido Paterno', flex: 1, minWidth: 150 },
        { field: 'apellido_2', headerName: 'Apellido Materno', flex: 1, minWidth: 150 },
        { field: 'curp', headerName: 'CURP', flex: 1, minWidth: 180 },
        { field: 'id_legal', headerName: 'ID Legal', flex: 1, minWidth: 120 },
        { field: 'id_sexo', headerName: 'Sexo', flex: 1, minWidth: 100 },
        { field: 'fec_nac', headerName: 'Fecha de Nacimiento', flex: 1, minWidth: 150 },
        { field: 'fec_alta_empleado', headerName: 'Fecha de Alta', flex: 1, minWidth: 150 },
        { field: 'fec_antiguedad', headerName: 'Fecha de Antigüedad', flex: 1, minWidth: 150 },
        { field: 'numero_ss', headerName: 'Número de Seguro Social', flex: 1, minWidth: 180 },
        { field: 'id_reg_issste', headerName: 'Registro ISSSTE', flex: 1, minWidth: 150 },
        { field: 'ahorr_soli_porc', headerName: 'Porcentaje de Ahorro Solidario', flex: 1, minWidth: 180 },
        { field: 'estado', headerName: 'Estado', flex: 1, minWidth: 120 },
        { field: 'deleg_municip', headerName: 'Delegación/Municipio', flex: 1, minWidth: 150 },
        { field: 'poblacion', headerName: 'Población', flex: 1, minWidth: 150 },
        { field: 'colonia', headerName: 'Colonia', flex: 1, minWidth: 150 },
        { field: 'direccion', headerName: 'Dirección', flex: 1, minWidth: 200 },
        { field: 'codigo_postal', headerName: 'Código Postal', flex: 1, minWidth: 120 },
        { field: 'num_interior', headerName: 'Número Interior', flex: 1, minWidth: 120 },
        { field: 'num_exterior', headerName: 'Número Exterior', flex: 1, minWidth: 120 },
        { field: 'calle', headerName: 'Calle', flex: 1, minWidth: 150 },
        { field: 'n_delegacion_municipio', headerName: 'Nombre Delegación/Municipio', flex: 1, minWidth: 200 },
        { field: 'ent_federativa', headerName: 'Entidad Federativa', flex: 1, minWidth: 180 },
        { field: 'sect_pres', headerName: 'Sector Presupuestal', flex: 1, minWidth: 180 },
        { field: 'n_puesto', headerName: 'Puesto', flex: 1, minWidth: 150 },
        { field: 'fecha_insercion', headerName: 'Fecha de Inserción', flex: 1, minWidth: 150 },
        { field: 'activo', headerName: 'Activo', flex: 1, minWidth: 100 },
        { field: 'nombre_nomina', headerName: 'Nombre Nómina', flex: 1, minWidth: 150 },
        { field: 'forma_de_pago', headerName: 'Forma de Pago', flex: 1, minWidth: 150 },
    ];

    // Estado para el modal
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]); // Filas seleccionadas

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/NominaCtrl/Empleados`);
                if (!response.ok) throw new Error('Error al obtener los datos');
                const json = await response.json();
                setData(json);
                setFilteredData(json);
            } catch (error) {
                console.error('Error al cargar los datos:', error);
            }
        };
        fetchData();
    }, []);

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

            <Box height="calc(100vh - 200px)" width="100%" maxWidth="1300px" style={{ overflowX: 'auto' }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    getRowId={(row) => row.id_empleado}
                    onRowDoubleClick={handleRowDoubleClick}
                    disableColumnMenu
                    disableColumnFilter
                    disableColumnSorting
                    checkboxSelection // Habilita checkboxes al inicio de cada fila
                    onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)} // Guarda las filas seleccionadas
                    sx={{
                        '& .MuiDataGrid-columnHeader': {
                            backgroundColor: '#9b1d1d', // Aplica el color correcto a TODA la fila del encabezado
                            color: 'white',
                            fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            color: 'white',
                            fontWeight: 'bold',
                        }
                    }}
                />
            </Box>
            <br></br>
            <Button onClick={() => setIsExportModalOpen(true)} variant="contained" color="primary">
                Exportar Datos
            </Button>

            <EmployeeDetailsModal open={isModalOpen} onClose={() => setIsModalOpen(false)} employeeData={selectedEmployee} />
            <ExportTableModal
                open={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                rows={data.filter(row => selectedRows.includes(row.id_empleado))} // Solo filas seleccionadas
                columns={columns}
            />
        </Box>
    );
}
