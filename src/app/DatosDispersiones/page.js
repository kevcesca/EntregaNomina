'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReusableTable3 from '../%Components/ReusableTable3/Reusabletable3';
import DateFilter from '../%Components/DateFilter/DateFilter';
import styles from './page.module.css';
import API_BASE_URL from '../%Config/apiConfig';

const VistaDispersiones = () => {
    // Estados para la fecha seleccionada
    const [anio, setAnio] = useState('');
    const [quincena, setQuincena] = useState('');

    // Estado para los datos de la tabla
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Configuración de las columnas para la tabla
    const columns = [
        { accessor: 'id_empleado', label: 'ID EMPLEADO', width: '15%' },
        { accessor: 'emp_nombre', label: 'NOMBRE DEL EMPLEADO', width: '30%' },
        { accessor: 'num_cuenta', label: 'NÚMERO DE CUENTA', width: '25%' },
        {
            accessor: 'monto',
            label: 'MONTO',
            width: '15%',
            render: (row) => row.monto || 0, // Muestra 0 si monto es null o 0
        },
        { accessor: 'nota_desc', label: 'DESCRIPCIÓN', width: '15%' },
    ];


    // Función para obtener los datos desde el servicio
    const fetchData = async (anio, quincena) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/consulta/datosDispersiones`, {
                params: { anio, quincena },
            });

            // Procesar los datos para reemplazar montos inválidos con 0
            const processedData = response.data.map((item) => ({
                ...item,
                monto: item.monto || 0, // Si monto es falsy, asignar 0
            }));

            setData(processedData); // Actualiza los datos procesados
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            setData([]); // Si hay error, limpia los datos
        } finally {
            setIsLoading(false); // Detiene la carga
        }
    };


    // Callback que se ejecuta al cambiar la fecha desde el DateFilter
    const handleDateChange = ({ anio, quincena }) => {
        setAnio(anio);
        setQuincena(quincena);

        // Llama al servicio con los nuevos parámetros
        fetchData(anio, quincena);
    };

    return (
        <Box className={styles.container}>
            {/* Título */}
            <Typography className={styles.title} variant="h4" gutterBottom>
                Datos Dispersiones
            </Typography>

            {/* Filtro de Fecha */}
            <DateFilter onDateChange={handleDateChange} />

            {/* Tabla Reusable */}
            <ReusableTable3
                columns={columns}
                fetchData={() => Promise.resolve(data.map(item => ({
                    ...item,
                    monto: item.monto || 0, // Reemplaza N/A por 0 al pasar los datos
                })))}
                editable={false}
                deletable={false}
                insertable={false}
                isLoading={isLoading}
            />

            <Button className={styles.volver}
                
                startIcon={<ArrowBackIcon />}
                onClick={() => (window.location.href = "/CargarEstadosCuenta")}
            >
                Volver
            </Button>


        </Box>

    );
};

export default VistaDispersiones;
