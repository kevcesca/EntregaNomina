"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, TextField, Button, Autocomplete, Alert } from "@mui/material";
import ReusableTable from "../../%Components/ReusableTable/ReusableTable"; // Ajusta la ruta según tu estructura
import API_BASE_URL, { API_USERS_URL } from "../../%Config/apiConfig"; // URL base para los servicios

const ConsultaAltas = () => {
    const [idEmpleado, setIdEmpleado] = useState("");
    const [employeeOptions, setEmployeeOptions] = useState([]); // Opciones de IDs de empleados
    const [isConsultarPressed, setIsConsultarPressed] = useState(false);
    const [error, setError] = useState(null); // Estado para errores

    // Columnas de la tabla
    const columns = [
        { label: "Registro", accessor: "Registro" },
        { label: "No. Empleado", accessor: "No. Empleado" },
        { label: "Nombre", accessor: "Nombre" },
        { label: "Tipo de Nómina", accessor: "Tipo de Nómina" },
        { label: "Primera QNA en la que Aparece el Empleado", accessor: "Primera QNA en la que Aparece el Empleado" },
        { label: "Fecha de Alta", accessor: "Fecha de Alta" },
    ];

    // Función para obtener las opciones de empleados
    useEffect(() => {
        const fetchEmployeeOptions = async () => {
            try {
                const response = await fetch(`${API_USERS_URL}/employee-ids-with-names`);
                if (!response.ok) throw new Error("Error al obtener empleados.");
                const data = await response.json();
                setEmployeeOptions(data); // [{ id_empleado, nombre_completo }]
            } catch (error) {
                console.error("Error al cargar empleados:", error);
                setError("Error al cargar los empleados disponibles.");
            }
        };

        fetchEmployeeOptions();
    }, []);

    // Función para obtener los datos del servicio
    const fetchAltas = async () => {
        if (!isConsultarPressed) return []; // No realizar solicitud hasta que se presione "Consultar"

        if (!idEmpleado) {
            setError("Por favor, selecciona un ID de empleado.");
            return [];
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/reporteAltas?idEmpleado=${idEmpleado}`
            );

            if (!response.ok) {
                throw new Error("Error al obtener los datos del servicio.");
            }

            const rawData = await response.json();
            console.log("Datos recibidos del servicio:", rawData); // Verificar los datos en la consola
            return rawData;
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            setError("No se pudo cargar la información. Verifica el ID de empleado.");
            return [];
        }
    };

    // Manejo del botón "Consultar"
    const handleConsultar = () => {
        setError(null); // Limpiar errores previos
        setIsConsultarPressed(true); // Permitir que `fetchAltas` haga la solicitud
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Consulta de Altas
            </Typography>

            {/* Formulario de selección de ID de empleado */}
            <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12}>
                    <Autocomplete
                        options={employeeOptions}
                        getOptionLabel={(option) => `${option.id_empleado} - ${option.nombre_completo}`}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="ID Empleado"
                                variant="outlined"
                                fullWidth
                                required
                                error={!!error && !idEmpleado}
                                helperText={!!error && !idEmpleado ? "El ID de empleado es requerido." : ""}
                            />
                        )}
                        onChange={(event, value) => setIdEmpleado(value?.id_empleado || "")}
                        isOptionEqualToValue={(option, value) => option.id_empleado === value?.id_empleado}
                    />
                </Grid>
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
                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error">{error}</Alert>
                    </Grid>
                )}
            </Grid>

            {/* Tabla de resultados */}
            <ReusableTable columns={columns} fetchData={fetchAltas} />
        </Box>
    );
};

export default ConsultaAltas;
