'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TablaEstadosCuenta.module.css';
import { Button } from '@mui/material';
import { Toast } from 'primereact/toast';
import API_BASE_URL from '../../%Config/apiConfig';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'; // Importar el componente LoadingOverlay

export default function TablaEstadosCuenta({ anio, quincena, session, setUploaded, mes }) {
    const toast = useRef(null);
    const [estadosCuenta, setEstadosCuenta] = useState([]); // Estado para guardar los datos de la tabla
    const [isUploadDisabled, setIsUploadDisabled] = useState(false); // Estado para controlar la habilitación del botón de subida
    const [isLoading, setIsLoading] = useState(false); // Estado para manejar el LoadingOverlay

    // Efecto para cargar los datos al cambiar el año o la quincena
    useEffect(() => {
        if (anio && quincena) {
            fetchEstadosCuentaData();
        }
    }, [anio, quincena]); // Dependencias: se vuelve a cargar cuando anio o quincena cambian

    // Función para obtener los datos de los estados de cuenta desde la API
    const fetchEstadosCuentaData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/consultaEdoCta?anio=${anio}&mes=${mes}`);
            setEstadosCuenta(response.data); // Actualizar el estado con los datos obtenidos
        } catch (error) {
            console.error('Error al cargar los datos de Estados de Cuenta', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los datos',
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
        formData.append('extra', ''); // Parámetro extra (si se requiere)

        const usuario = session || 'unknown';

        try {
            // Subida del archivo
            const response = await axios.post(
                `${API_BASE_URL}/SubirEdoCuenta?mes=${mes}&anio=${anio}&vuser=${usuario}&tipo_carga=EstadosCuenta`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            // Manejo de éxito
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Archivo subido correctamente: ${response.data.message || file.name}`,
                life: 3000,
            });

            setUploaded(true);
            fetchEstadosCuentaData(); // Actualizar los datos de la tabla
        } catch (error) {
            console.error('Error al subir el archivo', error);

            const errorMessage =
                error.response?.data?.message || 'Error desconocido al subir el archivo.';

            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error al subir el archivo: ${errorMessage}`,
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

                {/* Tabla que muestra los datos de los estados de cuenta */}
                <DataTable value={estadosCuenta} sortMode="multiple" className={styles.dataTable}>
                    <Column
                        field="nombre_archivo"
                        header="NOMBRE DE ARCHIVO"
                        sortable
                        style={{ width: '50%' }}
                    ></Column>
                    <Column
                        field="user_carga"
                        header="USUARIO"
                        sortable
                        style={{ width: '30%' }}
                    ></Column>
                    <Column
                        field="fecha_carga"
                        header="FECHA DE CARGA"
                        sortable
                        style={{ width: '20%' }}
                    ></Column>
                </DataTable>

                {/* Botón para subir un archivo */}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        component="label"
                        className={styles.uploadButton}
                        disabled={isUploadDisabled}
                    >
                        Subir Estados de Cuenta
                        <input
                            type="file"
                            hidden
                            onChange={(e) => handleFileUpload(e, 'estadoCuenta')}
                            accept=".xlsx"
                        />
                    </Button>
                </div>
            </div>
        </LoadingOverlay>
    );
}
