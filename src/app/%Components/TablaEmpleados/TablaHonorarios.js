'use client';

import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Collapse, Checkbox, FormControlLabel, Modal } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import API_BASE_URL from '../../%Config/apiConfig';
import styles from './TablaUsuarios.module.css';
import EmployeeDetailsModal from './EmployeeDetailsModal';

export default function HonorariosTable() {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState({});
    const [collapseOpen, setCollapseOpen] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null); // Datos del empleado seleccionado
    const [isModalOpen, setIsModalOpen] = useState(false); // Controla si el modal está abierto


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

    const handleRowDoubleClick = (params) => {
        setSelectedEmployee(params.row); // Guarda los datos del empleado seleccionado
        setIsModalOpen(true); // Abre el modal
    };

    const mapColumns = (cols) =>
        cols.map((col) => ({
            field: col.key,
            headerName: col.label,
            flex: 1,
            minWidth: 150,
        }));

    useEffect(() => {
        fetchData();

        const initialColumns = mapColumns(
            availableColumns.filter((col) => col.key === 'id' || col.key === 'nombre_empleado')
        );
        setColumns(initialColumns);

        const initialSelection = availableColumns.reduce((acc, col) => {
            acc[col.key] = false;
            return acc;
        }, {});
        setSelectedColumns(initialSelection);
    }, []);

    const handleGenerateTable = () => {
        const selectedKeys = Object.keys(selectedColumns).filter((key) => selectedColumns[key]);

        if (selectedKeys.length === 0) {
            setShowModal(true); // Mostrar modal si no se seleccionó ningún campo
            return;
        }

        const newColumns = mapColumns(availableColumns.filter((col) => selectedKeys.includes(col.key)));
        setColumns(newColumns);
        setCollapseOpen(false); // Cierra la sección de "Seleccionar Campos"
    };

    const handleColumnSelectionChange = (event) => {
        setSelectedColumns({
            ...selectedColumns,
            [event.target.name]: event.target.checked,
        });
    };

    const handleSelectAll = (event) => {
        const isChecked = event.target.checked;
        const updatedSelection = availableColumns.reduce((acc, col) => {
            acc[col.key] = isChecked;
            return acc;
        }, {});
        setSelectedColumns(updatedSelection);
    };

    const handleFilterChange = (event) => {
        const value = event.target.value.toLowerCase();
        setGlobalFilter(value);

        const filtered = data.filter((row) =>
            Object.values(row).some((val) => val?.toString().toLowerCase().includes(value))
        );
        setFilteredData(filtered);
    };

    const handleExport = (type) => {
        const filteredExportData = filteredData.map((row) => {
            const filteredRow = {};
            columns.forEach((col) => {
                filteredRow[col.field] = row[col.field];
            });
            return filteredRow;
        });

        if (type === 'pdf') {
            const doc = new jsPDF();
            const tableColumns = columns.map((col) => col.headerName);
            const tableRows = filteredExportData.map((row) =>
                columns.map((col) => row[col.field])
            );
            autoTable(doc, { head: [tableColumns], body: tableRows });
            doc.save('honorarios.pdf');
        } else if (type === 'csv') {
            const csvContent = [
                columns.map((col) => col.headerName).join(','), // Encabezados
                ...filteredExportData.map((row) =>
                    columns.map((col) => row[col.field]).join(',')
                ), // Filas
            ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'honorarios.csv');
        } else if (type === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            saveAs(
                new Blob([excelBuffer], { type: 'application/octet-stream' }),
                'honorarios.xlsx'
            );
        }
    };

    const ColumnSelector = ({ availableColumns, selectedColumns, onSelectionChange, onSelectAll }) => (
        <Box
            padding="20px"
            border="1px solid #c4c4c4"
            borderRadius="8px"
            maxWidth="1200px"
            margin="20px auto"
        >
            <Typography variant="h6" align="center" gutterBottom>
                Campos para generar tabla
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap="10px">
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={Object.values(selectedColumns).every((val) => val)}
                            indeterminate={
                                Object.values(selectedColumns).some((val) => val) &&
                                !Object.values(selectedColumns).every((val) => val)
                            }
                            onChange={onSelectAll}
                        />
                    }
                    label="Todos los campos"
                    style={{ gridColumn: 'span 4' }}
                />
                {availableColumns.map((col) => (
                    <FormControlLabel
                        key={col.key}
                        control={
                            <Checkbox
                                checked={selectedColumns[col.key] || false}
                                onChange={onSelectionChange}
                                name={col.key}
                            />
                        }
                        label={col.label}
                    />
                ))}
            </Box>

            <Box textAlign="center" marginTop="20px">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateTable}
                >
                    Generar Tabla
                </Button>
            </Box>
        </Box>
    );

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            padding="20px"
            backgroundColor="#f9f9f9"
        >
            <Typography variant="h4" gutterBottom>
                Tabla Honorarios
            </Typography>

            <TextField
                label="Buscar"
                variant="outlined"
                fullWidth
                value={globalFilter}
                onChange={handleFilterChange}
                style={{ marginBottom: '20px', maxWidth: '1200px' }}
            />

            <Button
                variant="contained"
                onClick={() => setCollapseOpen(!collapseOpen)}
                style={{ marginBottom: '20px' }}
            >
                Seleccionar Columnas
            </Button>

            <Collapse in={collapseOpen}>
                <ColumnSelector
                    availableColumns={availableColumns}
                    selectedColumns={selectedColumns}
                    onSelectionChange={handleColumnSelectionChange}
                    onSelectAll={handleSelectAll}
                />
            </Collapse>

            <Box
                height="calc(115vh - 400px)"
                width="100%"
                maxWidth="1400px"
                style={{ overflowX: 'auto' }}
            >
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    getRowId={(row) => row.id}
                    onRowDoubleClick={handleRowDoubleClick} // Manejo del doble clic
                />

            </Box>

            <Box marginTop="20px" display="flex" justifyContent="center" gap="20px">
                <Button variant="outlined" onClick={() => handleExport('csv')}>
                    Exportar CSV
                </Button>
                <Button variant="outlined" onClick={() => handleExport('excel')}>
                    Exportar Excel
                </Button>
                <Button variant="outlined" onClick={() => handleExport('pdf')}>
                    Exportar PDF
                </Button>
            </Box>

            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '50%',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: 24,
                        p: 4,
                        textAlign: 'center',
                    }}
                >
                    <Typography id="modal-title" variant="h6" gutterBottom>
                        Por favor selecciona al menos un campo
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setShowModal(false)}
                    >
                        Cerrar
                    </Button>
                </Box>
            </Modal>

            <EmployeeDetailsModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employeeData={selectedEmployee}
            />

        </Box>
    );
}
