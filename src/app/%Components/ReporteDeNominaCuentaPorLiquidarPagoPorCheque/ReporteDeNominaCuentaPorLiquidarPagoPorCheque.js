"use client";

import React, { useState } from "react";
import { Box, Typography, Alert, Button, Grid, TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import ReusableTableSeleccion from "../../%Components/ReusableTableSeleccion/ReusableTableSeleccion";
import API_BASE_URL from "../../%Config/apiConfig";

const ConsultaReporteHonorarios = () => {
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [isConsultarPressed, setIsConsultarPressed] = useState(false);
    const [error, setError] = useState(null);

    const columns = [
        { label: "Registro", accessor: "Registro" },
        { label: "ID Honorario", accessor: "ID Honorario" },
        { label: "Nombre Empleado", accessor: "Nombre Empleado" },
        { label: "Puesto", accessor: "Puesto" },
        { label: "Monto Pagado", accessor: "Monto Pagado" },
        { label: "Fecha de Pago", accessor: "Fecha de Pago" },
    ];

    // Función para obtener datos del servicio
    const fetchHonorarios = async () => {
        if (!isConsultarPressed) return []; // No realizar la solicitud hasta que se presione "Consultar"

        if (!fechaInicio || !fechaFin) {
            setError("Por favor, selecciona ambas fechas.");
            return [];
        }

        const formattedFechaInicio = fechaInicio.format("YYYY-MM-DD");
        const formattedFechaFin = fechaFin.format("YYYY-MM-DD");

        try {
            const response = await fetch(
                `${API_BASE_URL}/reporteHonorarios?fechaInicio=${formattedFechaInicio}&fechaFin=${formattedFechaFin}`
            );

            if (!response.ok) {
                throw new Error("Error al obtener los datos del servicio.");
            }

            const rawData = await response.json();
            console.log("Datos recibidos del servicio:", rawData); // Verificar los datos recibidos
            return rawData;
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            setError("No se pudo cargar la información. Verifica los datos.");
            return [];
        }
    };

    const handleConsultar = () => {
        setError(null); // Limpiar errores previos
        setIsConsultarPressed(true); // Permitir que `fetchHonorarios` realice la solicitud
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Reporte de Honorarios
            </Typography>

            {/* Formulario de selección de fechas */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="Fecha Inicio"
                            value={fechaInicio}
                            onChange={setFechaInicio}
                            renderInput={(params) => <TextField fullWidth {...params} />}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="Fecha Fin"
                            value={fechaFin}
                            onChange={setFechaFin}
                            renderInput={(params) => <TextField fullWidth {...params} />}
                        />
                    </Grid>
                </Grid>
            </LocalizationProvider>

            {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Botón de consulta */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleConsultar}
                sx={{ marginBottom: 3 }}
            >
                Consultar
            </Button>

            {/* Tabla de resultados */}
            <ReusableTableSeleccion columns={columns} fetchData={fetchHonorarios} />
        </Box>
    );
};

export default ConsultaReporteHonorarios;
