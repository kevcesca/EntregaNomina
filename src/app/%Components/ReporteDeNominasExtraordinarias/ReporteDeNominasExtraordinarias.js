"use client";

import React, { useState } from "react";
import { Box, Typography, Alert, Button, Grid, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import ReusableTable from "../../%Components/ReusableTable/ReusableTable";
import API_BASE_URL from "../../%Config/apiConfig";

const ConsultaNominasExtraordinarias = () => {
    const currentYear = new Date().getFullYear(); // Año actual
    const [anio, setAnio] = useState(currentYear); // Estado para el año
    const [quincena, setQuincena] = useState(""); // Estado para la quincena seleccionada
    const [isConsultarPressed, setIsConsultarPressed] = useState(false);
    const [error, setError] = useState(null);

    const columns = [
        { label: "Registro", accessor: "Registro" },
        { label: "Nómina Extraordinaria", accessor: "Nómina Extraordinaria" },
        { label: "CLC de la Nómina Generada", accessor: "CLC de la Nómina Generada" },
        { label: "Monto de CLC", accessor: "Monto de CLC" },
    ];

    // Función para obtener los datos del servicio
    const fetchNominasExtraordinarias = async () => {
        if (!isConsultarPressed) return [];

        if (!quincena || !anio) {
            setError("Por favor, selecciona el año y la quincena.");
            return [];
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/reporteNominasExtraordinarias?anio=${anio}&quincena=${quincena}&cargaCompleta=true&regCancelado=false`
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
        setIsConsultarPressed(true); // Permitir que `fetchNominasExtraordinarias` haga la solicitud
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Reporte de Nóminas Extraordinarias
            </Typography>

            {/* Formulario de selección de quincena y año */}
            <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Año"
                        type="number"
                        fullWidth
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                        InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel id="quincena-label">Quincena</InputLabel>
                        <Select
                            labelId="quincena-label"
                            value={quincena}
                            onChange={(e) => setQuincena(e.target.value)}
                            label="Quincena"
                        >
                            {Array.from({ length: 24 }, (_, i) => {
                                const quincenaNumber = String(i + 1).padStart(2, "0");
                                return (
                                    <MenuItem key={quincenaNumber} value={quincenaNumber}>
                                        {quincenaNumber}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Mostrar errores si los hay */}
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
            <ReusableTable columns={columns} fetchData={fetchNominasExtraordinarias} />
        </Box>
    );
};

export default ConsultaNominasExtraordinarias;
