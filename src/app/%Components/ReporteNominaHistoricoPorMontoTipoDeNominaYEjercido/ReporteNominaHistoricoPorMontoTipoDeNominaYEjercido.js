"use client";

import React, { useState } from "react";
import { Box, Typography, Alert, Button, Grid, TextField } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import ReusableTable from "../../%Components/ReusableTable/ReusableTable";
import API_BASE_URL from "../../%Config/apiConfig";

const ConsultaNominaHistorico = () => {
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [isConsultarPressed, setIsConsultarPressed] = useState(false);
    const [error, setError] = useState(null);

    const columns = [
        { label: "Registro", accessor: "Registro" },
        { label: "Tipo de Nómina", accessor: "Tipo de Nómina" },
        { label: "CLC de la Nómina Generada", accessor: "CLC de la Nómina Generada" },
        { label: "Periodo", accessor: "Periodo" },
        { label: "Monto de CLC", accessor: "Monto de CLC" },
        { label: "Pago de Inicio de Pago", accessor: "Pago de Inicio de Pago" },
        { label: "Monto Pagado", accessor: "Monto Pagado" },
        { label: "Pendiente por Pagar", accessor: "Pendiente por Pagar" },
    ];

    const fetchNominaHistorico = async () => {
        if (!isConsultarPressed) return [];

        if (!fechaInicio || !fechaFin) {
            setError("Por favor, selecciona ambas fechas.");
            return [];
        }

        const formattedFechaInicio = fechaInicio.format("YYYY-MM-DD");
        const formattedFechaFin = fechaFin.format("YYYY-MM-DD");

        try {
            const response = await fetch(
                `${API_BASE_URL}/reporteNominaHistorico?anio=2024&fechaInicio=${formattedFechaInicio}&fechaFin=${formattedFechaFin}`
            );

            if (!response.ok) {
                throw new Error("Error al obtener los datos del servicio.");
            }

            const rawData = await response.json();
            console.log("Datos recibidos del servicio:", rawData);
            return rawData;
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            setError("No se pudo cargar la información. Verifica los datos.");
            return [];
        }
    };

    const handleConsultar = () => {
        setError(null);
        setIsConsultarPressed(true);
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Reporte Histórico de Nómina
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
            <ReusableTable columns={columns} fetchData={fetchNominaHistorico} />
        </Box>
    );
};

export default ConsultaNominaHistorico;
