"use client";

import React, { useState, useEffect } from "react";
import { TextField, Button, Grid, Box, Typography, Autocomplete, Alert } from "@mui/material";
import ReusableTable from "../ReusableTable/ReusableTable"; // Ajusta la ruta según sea necesario
import API_BASE_URL, { API_USERS_URL } from "../../%Config/apiConfig"; // URL base para los servicios
import styles from './ReporteTipoPago.module.css';


const ReportesPage = () => {
    const [anio, setAnio] = useState(new Date().getFullYear()); // Año actual por defecto
    const [idEmpleado, setIdEmpleado] = useState("");
    const [employeeOptions, setEmployeeOptions] = useState([]); // Opciones para autocompletar IDs de empleados
    const [isConsultarPressed, setIsConsultarPressed] = useState(false);
    const [showErrors, setShowErrors] = useState(false); // Control de errores

    const columns = [
        { label: "Año", accessor: "anio" },
        { label: "Quincena", accessor: "quincena" },
        { label: "ID Empleado", accessor: "id_empleado" },
        { label: "Nombre", accessor: "nombre" },
        { label: "Apellido Paterno", accessor: "apellido_1" },
        { label: "Apellido Materno", accessor: "apellido_2" },
        { label: "Nómina", accessor: "nomina" },
        { label: "Descripción Extra", accessor: "desc_extraor" },
        { label: "Tipo de Pago", accessor: "tipopago" },
        { label: "Líquido", accessor: "liquido" },
        { label: "Fecha de Pago", accessor: "fec_pago" },
    ];

    // Cargar las opciones de empleados
    useEffect(() => {
        const fetchEmployeeOptions = async () => {
            try {
                const response = await fetch(`${API_USERS_URL}/employee-ids-with-names`);
                if (!response.ok) throw new Error("Error al obtener empleados");
                const data = await response.json();
                setEmployeeOptions(data); // [{ id_empleado, nombre_completo }]
            } catch (error) {
                console.error("Error al cargar empleados:", error);
            }
        };

        fetchEmployeeOptions();
    }, []);

    // Función para obtener datos del servicio
    const fetchReportes = async () => {
        if (!isConsultarPressed) return []; // No realiza la solicitud si no se presionó "Consultar"

        if (!anio || !idEmpleado) {
            setShowErrors(true);
            throw new Error("Por favor, ingresa el año y el ID del empleado.");
        }
        setShowErrors(false);

        try {
            const response = await fetch(
                `${API_BASE_URL}/consultaCLCPorEmpleado?anio=${anio}&idEmpleado=${idEmpleado}`
            );
            if (!response.ok) {
                throw new Error("Error al obtener los datos del reporte.");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    // Manejar el evento al presionar "Consultar"
    const handleConsultar = () => {
        setShowErrors(true); // Mostrar errores si faltan campos
        if (anio && idEmpleado) {
            setIsConsultarPressed(true); // Permitir que `fetchReportes` haga la solicitud
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Reportes de Nómina
            </Typography>
            <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <div className={styles.form}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Año"
                            variant="outlined"
                            fullWidth
                            value={anio}
                            onChange={(e) => setAnio(e.target.value)}
                            error={showErrors && !anio}
                            helperText={showErrors && !anio ? "El año es requerido" : ""}
                        />
                    </Grid>
                    <Grid className={styles.idEmpleado} item xs={12} sm={6}>
                        <Autocomplete
                            options={employeeOptions}
                            getOptionLabel={(option) => `${option.id_empleado} - ${option.nombre_completo}`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="ID Empleado"
                                    required
                                    fullWidth
                                    margin="normal"
                                    error={showErrors && !idEmpleado}
                                    helperText={showErrors && !idEmpleado ? "El ID del empleado es requerido" : ""}
                                />
                            )}
                            onChange={(event, value) => setIdEmpleado(value?.id_empleado || "")}
                            isOptionEqualToValue={(option, value) =>
                                option.id_empleado === value?.id_empleado
                            }
                        />
                    </Grid>
                </div>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleConsultar}
                    >
                        Consultar
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Alert severity="info">
                        Ingresa los datos y presiona "Consultar" para cargar el reporte.
                    </Alert>
                </Grid>
            </Grid>

            {/* Tabla de resultados */}
            <ReusableTable
                columns={columns}
                fetchData={fetchReportes} // Se ajusta para que dependa de `isConsultarPressed`
            />
        </Box>
    );
};

export default ReportesPage;
