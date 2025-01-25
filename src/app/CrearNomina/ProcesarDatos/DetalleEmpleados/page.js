"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Hook para recuperar parámetros de la URL y navegación
import { Box, Typography, Alert, Button } from "@mui/material";
import ReusableTable from "../../../%Components/ReusableTable/ReusableTable"; // Ajusta la ruta según sea necesario
import API_BASE_URL from "../../../%Config/apiConfig"; // URL base para los servicios

const ConsultaEmpleados = () => {
    const [error, setError] = useState(null); // Estado de error
    const router = useRouter(); // Hook para manejar navegación

    const searchParams = useSearchParams(); // Recupera los parámetros de la URL

    // Recuperar parámetros de la URL
    const anio = searchParams.get("anio");
    const quincena = searchParams.get("quincena");
    const nomina = searchParams.get("nomina");
    const banco = searchParams.get("banco");

    const columns = [
        { label: "Año", accessor: "ANIO" },
        { label: "Quincena", accessor: "QUINCENA" },
        { label: "Nómina", accessor: "NOMINA" },
        { label: "Banco", accessor: "BANCO" },
        { label: "Percepciones", accessor: "PERCEPCIONES" },
        { label: "Deducciones", accessor: "DEDUCCIONES" },
        { label: "Líquido", accessor: "LIQUIDO" },
        { label: "ID Empleado", accessor: "ID_EMPLEADO" },
        { label: "Nombre", accessor: "NOMBRE" },
        { label: "Apellido Paterno", accessor: "APELLIDO_1" },
        { label: "Apellido Materno", accessor: "APELLIDO_2" },
    ];

    // Función para obtener datos desde el servicio
    const fetchEmpleados = async () => {
        if (!anio || !quincena || !nomina || !banco) {
            setError("Faltan parámetros en la URL. Verifica los datos.");
            return [];
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/consultaEmpleados/especifico?anio=${anio}&quincena=${quincena}&nomina=${nomina}&banco=${banco}`
            );

            if (!response.ok) {
                throw new Error("Error al obtener los datos del servicio.");
            }

            const rawData = await response.json();
            console.log("Datos recibidos del servicio:", rawData); // Verificar los datos recibidos
            return rawData; // Devolver los datos para que `ReusableTable` los procese
        } catch (error) {
            console.error("Error al obtener los datos:", error);
            setError("No se pudo cargar la información. Por favor, verifica los parámetros.");
            return [];
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom>
                Consulta de Empleados
            </Typography>

            {/* Mostrar mensaje de error si ocurre algún problema */}
            {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Tabla de resultados */}
            <ReusableTable columns={columns} fetchData={fetchEmpleados} />

            {/* Botón para regresar */}
            <Button
                variant="contained"
                color="secondary"
                onClick={() => router.back()} // Regresa a la página anterior
                sx={{ marginTop: 3 }}
            >
                Regresar
            </Button>
        </Box>
    );
};

export default ConsultaEmpleados;
