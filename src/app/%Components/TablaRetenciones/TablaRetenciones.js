'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TablaRetenciones.module.css';
import { Button } from '@mui/material';
import { Toast } from 'primereact/toast';
import API_BASE_URL from '../../%Config/apiConfig';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'; // Importar el componente LoadingOverlay

export default function TablaRetenciones({ anio, quincena, session, setUploaded }) {
    const toast = useRef(null);
    const [dispersiones, setDispersiones] = useState([]); // Estado para guardar los datos de la tabla
    const [isLoading, setIsLoading] = useState(false); // Estado para manejar el LoadingOverlay

    useEffect(() => {
        fetchDispersionesData(); // Llamar a la función para obtener los datos
    }, [anio, quincena]);

    // Función para obtener los datos de las dispersiones
    const fetchDispersionesData = async () => {
        try {
            console.log(`Fetching data for anio: ${anio}, quincena: ${quincena}`);
            const response = await axios.get(
                `${API_BASE_URL}/consultaDispersion?anio=${anio}&quincena=${quincena}`
            );
            setDispersiones(
                response.data.map((item) => ({
                    nombreArchivo: item.nombre_archivo || 'Vacío',
                    quincena: item.quincena || '',
                }))
            );
        } catch (error) {
            console.error('Error fetching dispersiones data', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar las dispersiones',
                life: 3000,
            });
        }
    };

    // Función para manejar la subida de archivos
    const handleFileUpload = async (event, tipoEstado) => {
        if (!tipoEstado || !quincena) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Debe seleccionar una quincena y tipo de estado',
                life: 3000,
            });
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        setIsLoading(true); // Activar el LoadingOverlay
        const formData = new FormData();
        formData.append('file', file);
        formData.append('extra', ''); // Parámetro extra obligatorio

        const usuario = session || 'unknown';

        try {
            const response = await axios.post(
                `${API_BASE_URL}/SubirDisperciones?quincena=${quincena}&anio=${anio}&vuser=${usuario}&tipo_carga=Dispersion`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Archivo subido correctamente: ${response.data.message || file.name}`,
                life: 3000,
            });

            setUploaded(true);
            fetchDispersionesData(); // Recargar los datos
        } catch (error) {
            console.error('Error uploading file', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error al subir el archivo: ${
                    error.response?.data?.message || error.message
                }`,
                life: 3000,
            });
        } finally {
            setIsLoading(false); // Desactivar el LoadingOverlay
        }
    };

    return (
        <LoadingOverlay isLoading={isLoading}>
            <div className={`card ${styles.card}`}>
                <Toast ref={toast} />

                {/* Tabla que muestra los datos de dispersiones */}
                <DataTable value={dispersiones} sortMode="multiple" className={styles.dataTable}>
                    <Column
                        field="nombreArchivo"
                        header="NOMBRE DE ARCHIVO"
                        sortable
                        style={{ width: '50%' }}
                    ></Column>
                    <Column
                        field="quincena"
                        header="QUINCENA"
                        sortable
                        style={{ width: '25%' }}
                    ></Column>
                </DataTable>

                {/* Botón para subir un archivo */}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        component="label"
                        className={styles.uploadButton}
                        disabled={!quincena} // Deshabilitar si no se seleccionó quincena
                    >
                        Subir nuevo archivo
                        <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'dispersión')}
                            accept=".xlsx, .xlx"
                        />
                    </Button>
                </div>
            </div>
        </LoadingOverlay>
    );
}
