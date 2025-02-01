"use client";

import React, { useState } from "react";
import { Box, Typography, Grid, TextField, Button, Alert } from "@mui/material";
import ReusableTableSeleccion from "../../%Components/ReusableTableSeleccion/ReusableTableSeleccion"; // Ajusta la ruta según sea necesario
import API_BASE_URL from "../../%Config/apiConfig"; // URL base para los servicios

const ConsultaCLCQuincenaTotales = () => {
    const [anio, setAnio] = useState(new Date().getFullYear()); // Año actual por defecto
    const [quincenas, setQuincenas] = useState(""); // Quincenas separadas por comas
    const [isConsultarPressed, setIsConsultarPressed] = useState(false); // Control del botón "Consultar"
    const [error, setError] = useState(null); // Estado de error

    const columns = [
        { label: "Año", accessor: "ANIO" },
        { label: "Quincena", accessor: "QUINCENA" },
        { label: "Nómina", accessor: "nomina" },
        { label: "Descripción Extra", accessor: "desc_extraor" },
        { label: "Percepciones", accessor: "percepciones" },
        { label: "Deducciones", accessor: "deducciones" },
        { label: "Líquido", accessor: "liquido" },
        { label: "Empleados", accessor: "EMPLEADOS" },
        { label: "Concepto", accessor: "concepto" },
    ];

    // Función para obtener datos desde el servicio
    const fetchCLCQuincenaTotales = async () => {
        if (!isConsultarPressed) return []; // No realizar la solicitud hasta que se presione "Consultar"

        if (!anio || !quincenas) {
            setError("Por favor, completa todos los campos.");
            return [];
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/consultaCLCQuincenaTotales?anio=${anio}&${quincenas
                    .split(",")
                    .map((q) => `quincena=${q.trim()}`)
                    .join("&")}`
            );

            if (!response.ok) {
                throw new Error("Error al obtener los datos del servicio.");
            }

            const data = await response.json();
            console.log("Datos recibidos del servicio:", data); // Log para verificar datos
            return data; // Retorna los datos para que el componente `ReusableTableSeleccion` los procese
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            setError("No se pudo cargar la información. Por favor, intenta nuevamente.");
            return [];
        }
    };

    const handleConsultar = () => {
        setError(null); // Limpia errores previos
        setIsConsultarPressed(true); // Permite la solicitud al servicio en `fetchCLCQuincenaTotales`
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Consulta Totales por Quincena
            </Typography>

            {/* Mostrar mensaje de error si ocurre algún problema */}
            {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Formulario */}
            <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Año"
                        variant="outlined"
                        fullWidth
                        value={anio}
                        onChange={(e) => setAnio(e.target.value)}
                        helperText="Por ejemplo: 2024"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Quincenas"
                        variant="outlined"
                        fullWidth
                        value={quincenas}
                        onChange={(e) => setQuincenas(e.target.value)}
                        helperText="Ingresa las quincenas separadas por comas, por ejemplo: 01, 02, 03"
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
            </Grid>

            {/* Tabla de resultados */}
            <ReusableTableSeleccion
                columns={columns}
                fetchData={fetchCLCQuincenaTotales} // Pasa la función como prop
            />
        </Box>
    );
};

export default ConsultaCLCQuincenaTotales;
