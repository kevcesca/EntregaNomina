"use client";

import React, { useState } from "react";
import { Box, Typography, Grid, TextField, Button, Alert } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import ReusableTableSeleccion from "../../%Components/ReusableTableSeleccion/ReusableTableSeleccion"; // Ajusta la ruta según sea necesario
import API_BASE_URL from "../../%Config/apiConfig"; // URL base para los servicios

const ConsultaSaldosDiarios = () => {
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [isConsultarPressed, setIsConsultarPressed] = useState(false);
    const [error, setError] = useState(null); // Estado para errores

    // Columnas de la tabla
    const columns = [
        { label: "Registro", accessor: "Registro" },
        { label: "Día", accessor: "Día" },
        { label: "Banco/Cuenta", accessor: "Banco/Cuenta" },
        { label: "Total Egresos (Cargo)", accessor: "Total Egresos (Cargo)" },
        { label: "Total Ingresos (Abono)", accessor: "Total Ingresos (Abono)" },
        { label: "Saldo Inicial", accessor: "Saldo Inicial" },
        { label: "Saldo Final", accessor: "Saldo Final" },
        { label: "Número de Transacciones", accessor: "Número de Transacciones" },
        { label: "Conceptos del Día", accessor: "Conceptos del Día" },
    ];

    // Función para obtener los datos del servicio
    const fetchSaldosDiarios = async () => {
        if (!isConsultarPressed) return []; // No realizar la solicitud si no se presionó "Consultar"

        if (!fechaInicio || !fechaFin) {
            setError("Por favor, selecciona ambas fechas.");
            return [];
        }

        // Formatear las fechas para pasarlas al servicio
        const formattedFechaInicio = fechaInicio.format("YYYY-MM-DD");
        const formattedFechaFin = fechaFin.format("YYYY-MM-DD");

        try {
            const response = await fetch(
                `${API_BASE_URL}/saldosDiarios?fechaInicio=${formattedFechaInicio}&fechaFin=${formattedFechaFin}`
            );

            if (!response.ok) {
                throw new Error("Error al obtener los datos del servicio.");
            }

            const rawData = await response.json();
            console.log("Datos recibidos del servicio:", rawData); // Verificar datos en consola
            return rawData;
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            setError("No se pudo cargar la información. Verifica las fechas ingresadas.");
            return [];
        }
    };

    // Manejo del botón "Consultar"
    const handleConsultar = () => {
        setError(null); // Limpiar errores previos
        setIsConsultarPressed(true); // Permitir que `fetchSaldosDiarios` haga la solicitud
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Consulta de Saldos Diarios
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

            {/* Mostrar mensaje de error si ocurre */}
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

            {/* Tabla de resultados */}
            <ReusableTableSeleccion columns={columns} fetchData={fetchSaldosDiarios} />
        </Box>
    );
};

export default ConsultaSaldosDiarios;
