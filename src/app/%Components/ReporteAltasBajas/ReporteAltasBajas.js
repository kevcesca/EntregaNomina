"use client";

import React, { useState } from "react";
import { TextField, Button, Grid, Box, Typography, Alert } from "@mui/material";
import ReusableTable from "../ReusableTable/ReusableTable"; // Ajusta la ruta según sea necesario
import API_BASE_URL from "../../%Config/apiConfig"; // URL base para los servicios

const MovimientosBitacora = () => {
    const [anio, setAnio] = useState(new Date().getFullYear()); // Año actual por defecto
    const [quincenas, setQuincenas] = useState(""); // Quincenas ingresadas por el usuario
    const [campo, setCampo] = useState("curp"); // Campo por defecto
    const [isConsultarPressed, setIsConsultarPressed] = useState(false);
    const [showErrors, setShowErrors] = useState(false); // Control de errores

    const columns = [
        { label: "Año", accessor: "anio" },
        { label: "Quincena", accessor: "quincena" },
        { label: "Nómina", accessor: "nomina" },
        { label: "Descripción Extra", accessor: "desc_extraor" },
        { label: "Campo", accessor: "campo" },
        { label: "Nombre", accessor: "nombre" },
        { label: "Apellido Paterno", accessor: "apellido_1" },
        { label: "Apellido Materno", accessor: "apellido_2" },
        { label: "Valor Inicial", accessor: "valor_inicial" },
        { label: "Valor Final", accessor: "valor_final" },
    ];

    // Función para obtener datos del servicio
    const fetchMovimientos = async () => {
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
                `${API_BASE_URL}/consultaMovimientosBitacora?anio=${anio}&${queryString}&campo=${campo}`
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
            setIsConsultarPressed(true); // Permitir que `fetchMovimientos` haga la solicitud
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Movimientos en la Bitácora
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
                    <TextField
                        label="Campo"
                        variant="outlined"
                        fullWidth
                        value={campo}
                        onChange={(e) => setCampo(e.target.value)}
                        helperText="Especifica el campo a comparar (por defecto, curp)."
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
            <ReusableTable
                columns={columns}
                fetchData={fetchMovimientos} // Se ajusta para que dependa de `isConsultarPressed`
            />
        </Box>
    );
};

export default MovimientosBitacora;
