'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TablaPostNomina.module.css';
import { Button } from '@mui/material';
import { Toast } from 'primereact/toast';
import LoadingOverlay from '../../%Components/LoadingOverlay/LoadingOverlay';
import { Dialog, DialogTitle, DialogActions } from '@mui/material';
import API_BASE_URL from '../../%Config/apiConfig';

export default function TablaFiniquitos({ quincena, anio, session }) {
    const toast = useRef(null);
    const [finiquitos, setFiniquitos] = useState([]);
    const [isUploadDisabled, setIsUploadDisabled] = useState(false);
    const [canProcess, setCanProcess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isProcessed, setIsProcessed] = useState(false); // Controla si la nómina fue procesada
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    useEffect(() => {
        fetchFiniquitosData();
    }, [anio, quincena]);

    const fetchFiniquitosData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/consultaNominaCtrl/filtro`, {
                params: { anio, quincena },
            });

            const data = response.data
                .filter((item) => item.nombre_nomina === 'Finiquitos')
                .map((item) => ({
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
            setIsUploadDisabled(data.length >= 2);
            setCanProcess(data.length >= 2);
            setIsProcessed(data.some((archivo) => archivo.aprobado && archivo.aprobado2));
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los datos de finiquitos.',
                life: 3000,
            });
        }
    };

    const handleFileSelection = (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (selectedFiles.length !== 2) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Debes seleccionar exactamente 2 archivos.',
                life: 3000,
            });
            return;
        }
        setFilesToUpload(selectedFiles);
        setIsUploadDialogOpen(true);
    };

    const handleFileUpload = async () => {
        if (filesToUpload.length !== 2) return;

        setIsLoading(true);
        try {
            for (const file of filesToUpload) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('extra', '');

                const uploadURL = `${API_BASE_URL}/SubirNomina?quincena=${quincena}&anio=${anio}&tipo=Finiquitos&usuario=${session || 'unknown'}`;
                await axios.post(uploadURL, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Archivos subidos correctamente.',
                life: 3000,
            });

            setFilesToUpload([]);
            setIsUploadDialogOpen(false);
            fetchFiniquitosData();
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al subir los archivos.',
                life: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileDownload = async (idx, archivoNombre) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/descargarNomina`, {
                params: { idx },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', archivoNombre);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Archivo "${archivoNombre}" descargado correctamente.`,
                life: 3000,
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al descargar el archivo.',
                life: 5000,
            });
        }
    };

    const handleDeleteFile = async () => {
        if (!fileToDelete || !fileToDelete.idx) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No se encontró un identificador válido para el archivo.',
                life: 3000,
            });
            return;
        }

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
                fetchFiniquitosData();
            } else {
                throw new Error('Error al eliminar el archivo.');
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error al eliminar',
                detail: 'Hubo un problema al eliminar el archivo.',
                life: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcesarFiniquitos = async () => {
        setIsProcessing(true);
        try {
            const usuario = session || 'unknown';
            const endpoint = `${API_BASE_URL}/SubirNomina/dataBase?quincena=${quincena}&anio=${anio}&tipo=Finiquitos&usuario=${usuario}&extra=gatitoverdecito`;

            const response = await axios.get(endpoint);

            if (response.status === 200) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Finiquitos procesados correctamente.',
                    life: 3000,
                });

                const updatedFiniquitos = finiquitos.map((archivo) => ({
                    ...archivo,
                    aprobado: false, // Desactiva descarga
                    aprobado2: false, // Desactiva descarga
                }));
                setFiniquitos(updatedFiniquitos);

                setIsProcessed(true);
            } else {
                throw new Error('Error al procesar los finiquitos.');
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al procesar los finiquitos.',
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
                <DataTable value={finiquitos} className={styles.dataTable} paginator rows={10}>
                    <Column field="nombreArchivo" header="NOMBRE DE ARCHIVO" style={{ width: '30%' }} headerClassName={styles.customHeader} />
                    <Column field="tipoNomina" header="TIPO DE NÓMINA" style={{ width: '20%' }} headerClassName={styles.customHeader} />
                    <Column field="userCarga" header="USUARIO" style={{ width: '20%' }} headerClassName={styles.customHeader} />
                    <Column body={descargaTemplate} header="DESCARGA" style={{ width: '10%' }} headerClassName={styles.customHeader} />
                    <Column body={deleteTemplate} header="ELIMINAR" style={{ width: '10%' }} headerClassName={styles.customHeader} />
                </DataTable>

                <div className={styles.uploadContainer}>
                    <Button
                        variant="contained"
                        component="label"
                        className={styles.uploadButton}
                        disabled={isUploadDisabled}
                    >
                        Subir Nómina de Finiquitos
                        <input
                            type="file"
                            hidden
                            multiple
                            onChange={handleFileSelection}
                            accept=".xlsx"
                        />
                    </Button>

                    {canProcess && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleProcesarFiniquitos}
                            className={styles.procesarButton}
                            style={{ marginTop: '1rem' }}
                            disabled={isProcessed}
                        >
                            Procesar Finiquitos
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
                <DialogTitle>¿Desea subir los archivos seleccionados?</DialogTitle>
                <div style={{ padding: '1rem' }}>
                    <ul>
                        {filesToUpload.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
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
