'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TablaPostNomina.module.css';
import { Button } from '@mui/material';
import { Toast } from 'primereact/toast';
import API_BASE_URL from '../../%Config/apiConfig';
import LoadingOverlay from '../../%Components/LoadingOverlay/LoadingOverlay';
import { Dialog, DialogTitle, DialogActions } from '@mui/material';

export default function TablaPostNominaHonorarios({ quincena, anio, session, setProgress, setUploaded }) {
    const toast = useRef(null);
    const [archivos, setArchivos] = useState([]);
    const [isUploadDisabled, setIsUploadDisabled] = useState(false);
    const [canProcess, setCanProcess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isProcessed, setIsProcessed] = useState(false); // Estado para "Procesar Nómina"
    const [fileToUpload, setFileToUpload] = useState(null);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    useEffect(() => {
        fetchArchivosData();
    }, [anio, quincena]);

    const fetchArchivosData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/consultaNominaCtrl/filtro`, {
                params: { anio, quincena },
            });

            const data = response.data
                .filter(item => item.nombre_nomina === 'Honorarios')
                .map(item => ({
                    idx: item.idx,
                    nombreArchivo: item.nombre_archivo || 'Vacío',
                    tipoNomina: 'Honorarios',
                    archivoNombre: item.nombre_archivo,
                    fechaCarga: item.fecha_carga,
                    userCarga: item.user_carga,
                    aprobado: item.aprobado,
                    aprobado2: item.aprobado2,
                }));

            setArchivos(data);
            setIsUploadDisabled(data.length >= 1); // 🔥 Solo permite subir 1 archivo

            // 🔥 Si no hay archivos, permitir la subida
            if (data.length === 0) {
                setIsUploadDisabled(false);
            }

            setCanProcess(data.length >= 1); // Habilita el botón de "Procesar Nómina"
            setIsProcessed(data.some(archivo => archivo.aprobado && archivo.aprobado2));

        } catch (error) {
            console.error('Error fetching archivos data', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los archivos',
                life: 3000,
            });
        }
    };


    const handleFileSelection = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        setFileToUpload(selectedFile);
        setIsUploadDialogOpen(true);

        // 🔥 Forzar actualización del input para permitir subir el mismo archivo después de eliminarlo
        event.target.value = null;
    };


    const handleFileUpload = async () => {
        if (!fileToUpload) return;

        setIsUploadDialogOpen(false);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', fileToUpload);
            formData.append('extra', '');

            const uploadURL = `${API_BASE_URL}/SubirNomina?quincena=${quincena}&anio=${anio}&tipo=Honorarios&usuario=${session || 'unknown'}`;

            await axios.post(uploadURL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(progress);
                },
            });

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Archivo subido correctamente.',
                life: 3000,
            });

            setUploaded(true);
            setFileToUpload(null);
            setIsUploadDialogOpen(false);
            fetchArchivosData(); // 🔥 Recargar la tabla después de subir

        } catch (error) {
            console.error('Error uploading file', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al subir el archivo.',
                life: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };


    const handleFileDownload = async (idx, nombreArchivo) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/descargarNomina`, {
                params: { idx },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nombreArchivo);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Archivo "${nombreArchivo}" descargado correctamente.`,
                life: 3000,
            });
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo descargar el archivo.',
                life: 5000,
            });
        }
    };

    const handleDeleteFile = async () => {
        if (!fileToDelete) return;

        setIsLoading(true);

        try {
            const deleteURL = `${API_BASE_URL}/eliminarNomina?idx=${fileToDelete.idx}`;
            const response = await axios.get(deleteURL);

            if (response.status === 200 && response.data.includes('eliminado correctamente')) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Archivo eliminado correctamente.',
                    life: 3000,
                });

                setFileToDelete(null);
                setIsDeleteDialogOpen(false);
                await fetchArchivosData(); // 🔄 Asegurar que la tabla se actualice correctamente

                // 🔥 Habilitar nuevamente la subida después de eliminar
                setTimeout(() => {
                    setIsUploadDisabled(false);
                }, 300);

            } else {
                throw new Error(response.data || 'No se pudo eliminar el archivo.');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un problema al eliminar el archivo.',
                life: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };


    const handleProcesarNomina = async () => {
        setIsProcessing(true);

        try {
            const usuario = session || 'unknown';
            const endpoint = `${API_BASE_URL}/SubirNomina/dataBase?quincena=${quincena}&anio=${anio}&tipo=Honorarios&usuario=${usuario}&extra=gatitoverdecito`;

            const response = await axios.get(endpoint);

            if (response.status === 200) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Nómina procesada correctamente.',
                    life: 3000,
                });

                const updatedArchivos = archivos.map((archivo) => ({
                    ...archivo,
                    aprobado: false, // Descarga deshabilitada
                    aprobado2: false, // Descarga deshabilitada
                }));

                setArchivos(updatedArchivos);
                setIsProcessed(true);
            } else {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Hubo un problema al procesar la nómina.',
                    life: 3000,
                });
            }
        } catch (error) {
            console.error('Error processing payroll:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al procesar la nómina.',
                life: 5000,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const descargaTemplate = (rowData) => {
        const isDisabled = !rowData.aprobado || !rowData.aprobado2;

        return (
            <button
                className={styles.downloadButton}
                onClick={() => handleFileDownload(rowData.idx, rowData.nombreArchivo)}
                disabled={isDisabled}
                title={isDisabled ? 'No se puede descargar, aún no está aprobado' : 'Descargar'}
            >
                <i className="pi pi-download"></i>
            </button>
        );
    };

    const deleteTemplate = (rowData) => {
        const isDisabled = rowData.aprobado && rowData.aprobado2;

        return (
            <button
                className={`${styles.deleteButton} ${isDisabled ? styles.disabledButton : ''}`}
                onClick={() => {
                    setFileToDelete(rowData);
                    setIsDeleteDialogOpen(true);
                }}
                disabled={isDisabled}
                title={isDisabled ? 'No se puede eliminar, ya está aprobado' : ''}
            >
                <i className="pi pi-times"></i>
            </button>
        );
    };

    return (
        <div className={`card ${styles.card}`}>
            <Toast ref={toast} />
            <LoadingOverlay isLoading={isLoading || isProcessing}>
                <DataTable value={archivos} className={styles.dataTable} paginator rows={10}>
                    <Column field="nombreArchivo" header="NOMBRE DE ARCHIVO" style={{ width: '30%' }} headerClassName={styles.customHeader}></Column>
                    <Column field="tipoNomina" header="TIPO DE NÓMINA" style={{ width: '30%' }} headerClassName={styles.customHeader}></Column>
                    <Column field="userCarga" header="USUARIO" style={{ width: '30%' }} headerClassName={styles.customHeader}></Column>
                    <Column body={descargaTemplate} header="DESCARGA" style={{ width: '10%' }} headerClassName={styles.customHeader}></Column>
                    <Column body={deleteTemplate} header="ELIMINAR" style={{ width: '10%' }} headerClassName={styles.customHeader}></Column>
                </DataTable>

                <div className={styles.uploadContainer}>
                    <Button
                        variant="contained"
                        component="label"
                        className={styles.uploadButton}
                        disabled={isUploadDisabled}
                    >
                        Subir Nómina de Honorarios
                        <input type="file" hidden onChange={handleFileSelection} accept=".xlsx" />
                    </Button>

                    {canProcess && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleProcesarNomina}
                            className={styles.procesarButton}
                            style={{ marginTop: '1rem' }}
                            disabled={isProcessed}
                        >
                            Procesar Nómina
                        </Button>
                    )}
                </div>

            </LoadingOverlay>

            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogTitle>¿Está seguro de eliminar este archivo?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteFile} color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isUploadDialogOpen} onClose={() => setIsUploadDialogOpen(false)}>
                <DialogTitle>¿Desea subir este archivo?</DialogTitle>
                <div style={{ padding: '1rem' }}>
                    <p>Archivo seleccionado:</p>
                    <ul>
                        {fileToUpload && <li>{fileToUpload.name}</li>}
                    </ul>
                </div>
                <DialogActions>
                    <Button onClick={() => setIsUploadDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleFileUpload} color="primary">Subir</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
