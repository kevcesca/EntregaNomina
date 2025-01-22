'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TablaPostNomina.module.css';
import { Button } from '@mui/material';
import { Toast } from 'primereact/toast';
import API_BASE_URL from '../../%Config/apiConfig';
import AsyncButton from '../AsyncButton/AsyncButton';
import LoadingOverlay from '../../%Components/LoadingOverlay/LoadingOverlay'; // Importamos LoadingOverlay

export default function TablaFiniquitos({ quincena, anio, session }) {
    const toast = useRef(null);
    const [finiquitos, setFiniquitos] = useState([]);
    const [isUploadDisabled, setIsUploadDisabled] = useState(false); // Estado para deshabilitar el botón de carga
    const [canProcess, setCanProcess] = useState(false); // Estado para mostrar el botón "Procesar Finiquitos"
    const [isLoading, setIsLoading] = useState(false); // Estado para manejar el overlay de carga

    useEffect(() => {
        fetchFiniquitosData();
    }, [anio, quincena]);

    const fetchFiniquitosData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/consultaNominaCtrl/filtro`, {
                params: {
                    anio: anio,
                    quincena: quincena,
                },
            });

            const data = response.data
                .filter(item => item.nombre_nomina === 'Finiquitos')
                .map(item => ({
                    idx: item.idx,
                    nombreArchivo: item.nombre_archivo || 'Vacío',
                    tipoNomina: 'Finiquitos',
                    archivoNombre: item.nombre_archivo,
                    fechaCarga: item.fecha_carga,
                    userCarga: item.user_carga,
                    aprobado: item.aprobado,
                    aprobado2: item.aprobado2,
                }));

            setFiniquitos(data);
            setIsUploadDisabled(data.length >= 2); // Desactivar botón de carga si hay 2 o más archivos
            setCanProcess(data.length >= 2); // Habilitar botón de "Procesar Finiquitos" si hay archivos suficientes
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar los archivos de finiquitos', life: 3000 });
        }
    };

    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files.length) return;

        setIsLoading(true); // Mostrar overlay durante la carga

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('extra', ''); // Enviar el parámetro `extra` vacío

            const uploadURL = `${API_BASE_URL}/SubirNomina?quincena=${quincena}&anio=${String(anio)}&tipo=Finiquitos&usuario=${session || 'unknown'}`;

            try {
                const response = await axios.post(uploadURL, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                toast.current.show({ severity: 'success', summary: 'Éxito', detail: `Archivo subido correctamente: ${response.data.message}`, life: 3000 });
                fetchFiniquitosData(); // Recargar tabla tras la subida
            } catch (error) {
                const errorMessage = `Error al subir el archivo: ${error.response?.data?.message || error.message}`;
                toast.current.show({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
            } finally {
                setTimeout(() => setIsLoading(false), 2000); // Simular carga por 2 segundos tras finalizar
            }
        }
    };

    const handleFileDownload = async (archivoNombre) => {
        if (!archivoNombre) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se ha definido un archivo para descargar', life: 3000 });
            return;
        }

        const nombreSinExtension = archivoNombre.replace(/\.[^/.]+$/, "");

        try {
            const response = await axios.get(`${API_BASE_URL}/download`, {
                params: {
                    quincena: quincena,
                    anio: anio,
                    tipo: 'Finiquitos',
                    nombre: nombreSinExtension,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', archivoNombre || `reporte_finiquitos_${anio}_${quincena}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Archivo descargado correctamente', life: 3000 });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error al descargar el archivo: ${error.response?.data?.message || error.message}`,
                life: 3000,
            });
        }
    };

    const handleProcesarFiniquitos = async () => {
        try {
            const usuario = session || 'unknown';
            const endpoint = `${API_BASE_URL}/SubirNomina/dataBase?quincena=${quincena}&anio=${anio}&tipo=Finiquitos&usuario=${usuario}&extra=gatitoverdecito`;

            const response = await axios.get(endpoint);

            if (response.status === 200) {
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Finiquitos procesados correctamente.', life: 3000 });
            } else {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un problema al procesar los finiquitos.', life: 3000 });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Hubo un error al procesar los finiquitos.', life: 3000 });
        }
    };

    const descargaTemplate = (rowData) => {
        const isDisabled = rowData.aprobado !== true || rowData.aprobado2 !== true;

        return (
            <button
                className={styles.downloadButton}
                onClick={() => handleFileDownload(rowData.archivoNombre)}
                disabled={isDisabled}
                title={isDisabled ? 'No se puede descargar, aún no está aprobado' : ''}
            >
                <i className="pi pi-download"></i>
            </button>
        );
    };

    return (
        <div className={`card ${styles.card}`}>
            <Toast ref={toast} />
            <LoadingOverlay isLoading={isLoading}> {/* Overlay para la subida */}
                <DataTable value={finiquitos} sortMode="multiple" className={styles.dataTable} paginator rows={10}>
                    <Column field="nombreArchivo" header="NOMBRE DE ARCHIVO"  style={{ width: '40%' }} headerClassName={styles.customHeader}></Column>
                    <Column field="tipoNomina" header="TIPO DE NÓMINA"  style={{ width: '30%' }}headerClassName={styles.customHeader}></Column>
                    <Column field="userCarga" header="USUARIO"  style={{ width: '20%' }}headerClassName={styles.customHeader}></Column>
                    <Column body={descargaTemplate} header="DESCARGA" style={{ width: '10%' }}headerClassName={styles.customHeader}></Column>
                </DataTable>

                <div className={styles.uploadContainer}>
                    <Button
                        variant="contained"
                        component="label"
                        className={styles.uploadButton}
                        disabled={isUploadDisabled}
                    >
                        Subir Nómina de Finiquitos
                        <input type="file" hidden onChange={handleFileUpload} accept=".xlsx" multiple />
                    </Button>

                    {canProcess && (
                        <AsyncButton>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleProcesarFiniquitos}
                                className={styles.procesarButton}
                                style={{ marginTop: '1rem' }}
                            >
                                Procesar Finiquitos
                            </Button>
                        </AsyncButton>
                    )}
                </div>
            </LoadingOverlay>
        </div>
    );
}
