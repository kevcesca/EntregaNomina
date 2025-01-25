"use client";

import React, { useState } from "react";
import { Box, Typography, TextField, Button, Grid, Alert } from "@mui/material";
import ReusableTable from "../../%Components/ReusableTable/ReusableTable"; // Ajusta la ruta según sea necesario
import API_BASE_URL from "../../%Config/apiConfig"; // URL base para los servicios

const ConsultaCLCMovimiento = () => {
    const [anio, setAnio] = useState(new Date().getFullYear()); // Año actual por defecto
    const [codigo, setCodigo] = useState(""); // Código del concepto
    const [isConsultarPressed, setIsConsultarPressed] = useState(false); // Control del botón "Consultar"
    const [error, setError] = useState(null); // Estado de error

    const columns = [
        { label: "Año", accessor: "anio" },
        { label: "Quincena", accessor: "quincena" },
        { label: "Fecha Validación", accessor: "fecha_val" },
        { label: "Movimiento", accessor: "movto" },
        { label: "Concepto", accessor: "concepto" },
        { label: "Abono", accessor: "abono" },
    ];

    // Función para obtener datos desde el servicio
    const fetchCLCData = async () => {
        if (!isConsultarPressed) return []; // No realizar la solicitud hasta que se presione "Consultar"

        if (!anio || !codigo) {
            setError("Por favor, ingresa el año y el código del concepto.");
            return [];
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/consultaCLCMovimientoConcepto?anio=${anio}&codigo=${codigo}`
            );

            if (!response.ok) {
                throw new Error("Error al obtener los datos del servicio.");
            }

            const data = await response.json();
            console.log("Datos recibidos del servicio:", data); // Verificar los datos recibidos
            return data; // Devolver los datos para que `ReusableTable` los procese
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            setError("No se pudo cargar la información. Por favor, verifica los parámetros.");
            return [];
        }
    };

    const handleConsultar = () => {
        setError(null); // Limpiar errores previos
        setIsConsultarPressed(true); // Habilitar la solicitud en `fetchCLCData`
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Consulta de Movimientos de CLC por Concepto
            </Typography>

            {/* Formulario para Año y Código */}
            <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Año"
                        variant="outlined"
                        fullWidth
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                        error={Boolean(error) && !anio}
                        helperText={Boolean(error) && !anio ? "El año es requerido" : ""}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Código del Concepto"
                        variant="outlined"
                        fullWidth
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        error={Boolean(error) && !codigo}
                        helperText={Boolean(error) && !codigo ? "El código es requerido" : ""}
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
                <Grid item xs={12}>
                    <Alert severity="info">
                        Ingresa los datos y presiona "Consultar" para cargar el reporte.
                    </Alert>
                </Grid>
            </Grid>

            {/* Mostrar mensaje de error si ocurre algún problema */}
            {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Tabla de resultados */}
            <ReusableTable columns={columns} fetchData={fetchCLCData} />
        </Box>
    );
};

export default ConsultaCLCMovimiento;
