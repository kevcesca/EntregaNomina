'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReusableTable3 from '../%Components/ReusableTable3/Reusabletable3';
import DateFilter from '../%Components/DateFilter/DateFilter';
import styles from './VistaEdoCta.module.css';
import API_BASE_URL from '../%Config/apiConfig';



const VistaEdoCta = () => {
    // Estados para la fecha seleccionada
    const [anio, setAnio] = useState('');
    const [quincena, setQuincena] = useState('');

    // Estado para los datos de la tabla
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Configuración de las columnas para la tabla
    const columns = [
        { accessor: 'id', label: 'ID', width: '10%' },
        { accessor: 'movto', label: 'MOVIMIENTO', width: '15%' },
        { accessor: 'codigo', label: 'CÓDIGO', width: '10%' },
        { accessor: 'concepto', label: 'CONCEPTO', width: '25%' },
        { accessor: 'cargo', label: 'CARGO', width: '10%' },
        { accessor: 'abono', label: 'ABONO', width: '10%' },
        { accessor: 'saldo', label: 'SALDO', width: '10%' },
        { accessor: 'fecha_op', label: 'FECHA OPERACIÓN', width: '10%' },
        { accessor: 'fecha_val', label: 'FECHA VALOR', width: '10%' },
    ];

    // Función para convertir quincena en mes
    const quincenaAMes = (quincena) => {
        return Math.ceil(quincena / 2); // Ejemplo: Quincena 1 y 2 → Mes 1 (Enero)
    };

    // Función para obtener los datos desde el servicio

    const fetchData = async (mes, anio) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/consulta/datosEdoCta?mes=${mes}&anio=${anio}`, {
                params: { mes, anio }, // Enviamos los parámetros como query params
            });
            setData(response.data); // Actualiza los datos con la respuesta del servicio
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

        const mes = quincenaAMes(quincena); // Convierte la quincena a mes
        fetchData(mes, anio); // Llama al servicio con los nuevos parámetros
    };

    return (
        <Box className={styles.container}>
            {/* Título */}
            <Typography className={styles.title} variant="h4" gutterBottom>
                Datos Estado de Cuenta
            </Typography>

            {/* Filtro de Fecha */}
            <DateFilter onDateChange={handleDateChange} />

            {/* Tabla Reusable */}
            <ReusableTable3
                columns={columns}
                fetchData={() => Promise.resolve(data)} // Pasa los datos obtenidos
                editable={false}
                deletable={false}
                insertable={false}
                isLoading={isLoading} // Muestra la carga si se están obteniendo datos
            />

            <Button
                color="primary"
                startIcon={<ArrowBackIcon />}
                onClick={() => (window.location.href = "/CargarEstadosCuenta")}
            >
                Volver
            </Button>
        </Box>
    );
};

export default VistaEdoCta;
