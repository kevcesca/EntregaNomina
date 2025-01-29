"use client";

import React, { useState } from "react";
import { Box, Typography, Grid, TextField, Button, Alert } from "@mui/material";
import ReusableTable from "../../%Components/ReusableTable/ReusableTable"; // Ajusta la ruta si es necesario
import API_BASE_URL from "../../%Config/apiConfig"; // URL base para los servicios

const ConsultaReporteMovimientos = () => {
    const [anio, setAnio] = useState(new Date().getFullYear()); // Año actual por defecto
    const [quincenas, setQuincenas] = useState(""); // Quincenas separadas por comas
    const [isConsultarPressed, setIsConsultarPressed] = useState(false); // Control del botón "Consultar"
    const [error, setError] = useState(null); // Manejo de errores

    // Definición de las columnas de la tabla
    const columns = [
        { label: "Registro", accessor: "Registro" },
        { label: "Quincena", accessor: "Quincena" },
        { label: "No. Empleado", accessor: "No. Empleado" },
        { label: "Nombre", accessor: "Nombre" },
        { label: "Percepciones", accessor: "Percepciones" },
        { label: "Deducciones", accessor: "Deducciones" },
        { label: "Monto Neto", accessor: "Monto Neto" },
        { label: "Periodo", accessor: "Periodo" },
    ];

    // Función para obtener los datos del servicio
    const fetchReporteMovimientos = async () => {
        if (!isConsultarPressed) return []; // Evita solicitudes si no se presionó "Consultar"

        if (!anio || !quincenas) {
            setError("Por favor, ingresa el año y al menos una quincena.");
            return [];
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/reporteMovimientos?anio=${anio}&quincenas=${quincenas}`
            );

            if (!response.ok) {
                throw new Error("Error al obtener los datos del servicio.");
            }

            const rawData = await response.json();
            console.log("Datos recibidos del servicio:", rawData); // Debug para verificar los datos
            return rawData;
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            setError("No se pudo cargar la información. Verifica los datos ingresados.");
            return [];
        }
    };

    // Manejar el evento del botón "Consultar"
    const handleConsultar = () => {
        setError(null); // Limpiar errores previos
        setIsConsultarPressed(true); // Activa la consulta
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Consulta de Movimientos de Nómina
            </Typography>

            {/* Formulario para Año y Quincenas */}
            <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Año"
                        variant="outlined"
                        fullWidth
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                        error={!anio && isConsultarPressed}
                        helperText={!anio && isConsultarPressed ? "El año es requerido" : ""}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Quincenas (separadas por coma)"
                        variant="outlined"
                        fullWidth
                        placeholder="Ejemplo: 01,02,03"
                        value={quincenas}
                        onChange={(e) => setQuincenas(e.target.value)}
                        error={!quincenas && isConsultarPressed}
                        helperText={
                            !quincenas && isConsultarPressed
                                ? "Debes ingresar al menos una quincena"
                                : ""
                        }
                    />
                </Grid>
            </Grid>

            {/* Mostrar errores */}
            {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Botón para consultar */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleConsultar}
                sx={{ marginBottom: 3 }}
            >
                Consultar
            </Button>

            {/* Tabla con resultados */}
            <ReusableTable columns={columns} fetchData={fetchReporteMovimientos} />
        </Box>
    );
};

export default ConsultaReporteMovimientos;
