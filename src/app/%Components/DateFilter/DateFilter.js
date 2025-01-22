import React, { useState, useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import { Calendar } from 'primereact/calendar';
import styles from './DateFilter.module.css';

export default function DateFilter({ onDateChange }) {
    const [quincenaTexto, setQuincenaTexto] = useState('');
    const [anio, setAnio] = useState('');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

    const actualizarFecha = (fecha) => {
        if (!fecha) return;

        const fechaActual = new Date(fecha);
        const dia = fechaActual.getDate();
        const mesNumero = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Mes como número con dos dígitos
        const mesTexto = fechaActual.toLocaleString('es-ES', { month: 'long' }); // Mes como texto (ej. "noviembre")
        const anioSeleccionado = fechaActual.getFullYear();

        let numeroQuincena = null;
        let textoQuincena = '';

        if (dia >= 1 && dia <= 15) {
            numeroQuincena = ((parseInt(mesNumero) * 2) - 1).toString().padStart(2, '0'); // Quincena impar con dos dígitos
            textoQuincena = `1ra quincena de ${mesTexto}`;
        } else if (dia >= 16 && dia <= 31) {
            numeroQuincena = (parseInt(mesNumero) * 2).toString().padStart(2, '0'); // Quincena par con dos dígitos
            textoQuincena = `2da quincena de ${mesTexto}`;
        }

        if (numeroQuincena) {
            setQuincenaTexto(textoQuincena);
            setAnio(anioSeleccionado);

            // Notificar al componente padre el año, quincena y la fecha seleccionada (formato ISO)
            if (onDateChange) {
                onDateChange({ 
                    anio: anioSeleccionado, 
                    quincena: numeroQuincena,
                    fechaSeleccionada: fechaActual, // Mantiene compatibilidad con el valor anterior
                    fechaISO: fechaActual.toISOString().split('T')[0] // Nueva propiedad
                });
            }
        } else {
            setQuincenaTexto('Fecha no válida');
            setAnio('');
        }
    };

    // Establecer la fecha actual al cargar el componente
    useEffect(() => {
        const hoy = new Date();
        setFechaSeleccionada(hoy); // Establecer la fecha actual como seleccionada
        actualizarFecha(hoy); // Actualizar los datos basados en la fecha actual
    }, []);

    return (
        <Box className={styles.dateFilter}>
            <Calendar
                dateFormat="yy-mm-dd"
                value={fechaSeleccionada}
                onChange={(e) => {
                    setFechaSeleccionada(e.value);
                    actualizarFecha(e.value);
                }}
                placeholder="Seleccione una fecha"
                className={styles.calendar}
            />
            <TextField
                label="Quincena"
                value={quincenaTexto}
                placeholder="Quincena automática"
                InputProps={{ readOnly: true }}
                className={styles.textField}
            />
            <TextField
                label="Año"
                value={anio}
                placeholder="Año automático"
                InputProps={{ readOnly: true }}
                className={styles.textField}
            />
        </Box>
    );
}
