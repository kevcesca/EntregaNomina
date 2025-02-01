"use client";

import React, { useState } from "react";
import { TextField, Button, Grid, Box, Typography, Alert } from "@mui/material";
import ReusableTableSeleccion from "../ReusableTableSeleccion/ReusableTableSeleccion"; // Ajusta la ruta según sea necesario
import API_BASE_URL from "../../%Config/apiConfig"; // URL base para los servicios

const ReporteCLC = () => {
    const [anio, setAnio] = useState(new Date().getFullYear()); // Año actual por defecto
    const [quincenas, setQuincenas] = useState(""); // Quincenas ingresadas por el usuario
    const [isConsultarPressed, setIsConsultarPressed] = useState(false);
    const [showErrors, setShowErrors] = useState(false); // Control de errores

    const columns = [
        { label: "Año", accessor: "ANIO" },
        { label: "Quincena", accessor: "QUINCENA" },
        { label: "Nómina", accessor: "nomina" },
        { label: "Descripción Extra", accessor: "desc_extraor" },
        { label: "Líquido", accessor: "liquido" },
        { label: "Concepto", accessor: "concepto" },
        { label: "LPAD", accessor: "lpad" },
    ];

    // Función para obtener datos del servicio
    const fetchCLCData = async () => {
        if (!isConsultarPressed) return []; // No realiza la solicitud si no se presionó "Consultar"

        if (!anio || !quincenas) {
            setShowErrors(true);
            throw new Error("Por favor, completa todos los campos.");
        }
        setShowErrors(false);

        try {
            const quincenasArray = quincenas
                .split(",")
                .map((q) => q.trim())
                .filter((q) => q); // Limpiar espacios y eliminar quincenas vacías

            const queryString = quincenasArray
                .map((q) => `quincena=${q}`)
                .join("&");

            const response = await fetch(
                `${API_BASE_URL}/consultaCLCVaraiasQuincenas?anio=${anio}&${queryString}`
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
        if (anio && quincenas) {
            setIsConsultarPressed(true); // Permitir que `fetchCLCData` haga la solicitud
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Reporte CLC - Varias Quincenas
            </Typography>
            <Grid container spacing={2} sx={{ marginBottom: 3 }}>
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
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Quincenas (separadas por comas)"
                        variant="outlined"
                        fullWidth
                        value={quincenas}
                        onChange={(e) => setQuincenas(e.target.value)}
                        error={showErrors && !quincenas}
                        helperText={
                            showErrors && !quincenas
                                ? "Ingresa al menos una quincena (separadas por comas)."
                                : ""
                        }
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
                        Ingresa las quincenas, selecciona el año y presiona "Consultar" para cargar el reporte.
                    </Alert>
                </Grid>
            </Grid>

            {/* Tabla de resultados */}
            <ReusableTableSeleccion
                columns={columns}
                fetchData={fetchCLCData} // Se ajusta para que dependa de `isConsultarPressed`
            />
        </Box>
    );
};

export default ReporteCLC;
