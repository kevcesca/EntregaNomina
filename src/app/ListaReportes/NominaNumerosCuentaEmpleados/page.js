'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import { ThemeProvider, Typography, Box, Grid, Chip } from '@mui/material';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import API_BASE_URL from '../../%Config/apiConfig';
import theme from '../../$tema/theme';
import styles from '../page.module.css';

export default function TablaMovimientosVariasQuincenas() {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [anio, setAnio] = useState('2024');
    const [quincenas, setQuincenas] = useState(['01', '02', '03']); // Quincenas de ejemplo
    const dt = useRef(null);
    const toast = useRef(null);

    const availableColumns = [
        { key: 'id_empleado', label: 'ID Empleado', defaultSelected: true },
        { key: 'nombre', label: 'Nombre', defaultSelected: true },
        { key: 'apellido_1', label: 'Apellido Paterno', defaultSelected: true },
        { key: 'apellido_2', label: 'Apellido Materno', defaultSelected: true },
        { key: 'anio', label: 'Año', defaultSelected: true },
        { key: 'quincena', label: 'Quincena', defaultSelected: true },
        { key: 'nomina', label: 'Nómina', defaultSelected: true },
        { key: 'liquido', label: 'Líquido', defaultSelected: true },
        { key: 'transferencia', label: 'Transferencia', defaultSelected: true },
        { key: 'num_cuenta', label: 'Número de Cuenta', defaultSelected: true },
        { key: 'fec_pago', label: 'Fecha de Pago', defaultSelected: true }
    ];

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const quincenasParams = quincenas.map(q => `quincena=${q}`).join('&');
            const url = `${API_BASE_URL}/consultaMovimientosVariasQuincenas?anio=${anio}&${quincenasParams}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Error al obtener los datos: ' + response.statusText);
            }

            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la data.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [anio, quincenas]);

    const handleQuincenaChange = (event) => {
        const value = event.target.value;
        const quincenasArray = value.split(',').map(q => q.trim());
        setQuincenas(quincenasArray);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <Typography variant="h4" className={styles.titulo}>Consulta de Movimientos por Varias Quincenas</Typography>
            <span className="p-input-icon-left" style={{ width: '400px', marginTop: '2rem' }}>
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar..."
                    style={{ width: '100%', marginLeft: '2rem' }}
                />
            </span>
        </div>
    );

    return (
        <ThemeProvider theme={theme}>
            <div className={styles.main}>
                <h1 className={styles.h1}>Reporte de Movimientos por Varias Quincenas</h1>
                <Toast ref={toast} />
                <Box className={styles.dropForm}>
                    <Typography variant="h6" className={styles.exportText}>Parametros de consulta</Typography>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            fetchData();
                        }}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <InputText
                                    value={anio}
                                    onChange={(e) => setAnio(e.target.value)}
                                    placeholder="Año"
                                    style={{ width: '80%', padding: "1rem", margin: "2rem" }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InputText
                                    value={quincenas.join(', ')}
                                    onChange={handleQuincenaChange}
                                    placeholder="Quincenas (ej. 01, 02, 03)"
                                    style={{ width: '80%', padding: "1rem", margin: "2rem" }}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            label="Consultar"
                            className="p-button-primary"
                            style={{ marginTop: '1rem' }}
                        />
                    </form>
                </Box>

                <Toolbar className="mb-4" right={() => (
                    <div className="flex align-items-center justify-content-end gap-2">
                        <Button
                            type="button"
                            icon="pi pi-file"
                            rounded
                            onClick={() => exportCSV()}
                            data-pr-tooltip="CSV"
                        />
                    </div>
                )} />

                {isLoading ? (
                    <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
                ) : (
                    <DataTable
                        ref={dt}
                        value={data}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        globalFilter={globalFilter}
                        header={header}
                        responsiveLayout="scroll"
                        className="p-datatable-sm p-datatable-gridlines"
                    >
                        {availableColumns.map(column => (
                            <Column
                                key={column.key}
                                field={column.key}
                                header={column.label}
                                sortable
                            />
                        ))}
                    </DataTable>
                )}
            </div>
        </ThemeProvider>
    );
}
