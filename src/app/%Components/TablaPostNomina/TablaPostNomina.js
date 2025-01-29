'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TablaPostNomina.module.css';
import { Button } from '@mui/material';
import { Toast } from 'primereact/toast';
import API_BASE_URL from '../../%Config/apiConfig';
import LoadingOverlay from '../../%Components/LoadingOverlay/LoadingOverlay'; // Importamos el nuevo componente
import { Dialog, DialogTitle, DialogActions } from '@mui/material';


export default function TablaPostNomina({ quincena, anio, session, setProgress, setUploaded }) {
    const toast = useRef(null);
    const [archivos, setArchivos] = useState([]);
    const [isUploadDisabled, setIsUploadDisabled] = useState(false);
    const [canProcess, setCanProcess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filesToUpload, setFilesToUpload] = useState([]); // Estado para manejar los archivos seleccionados
    const [fileToDelete, setFileToDelete] = useState(null); // Estado para el archivo que se va a eliminar
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isProcessed, setIsProcessed] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileToUpload, setFileToUpload] = useState(null); // Estado para manejar el archivo seleccionado




    useEffect(() => {
        fetchArchivosData();
    }, [anio, quincena]);

    const fetchArchivosData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/consultaNominaCtrl/filtro`, {
                params: { anio, quincena },
            });

            const data = response.data
                .filter(item => item.nombre_nomina === 'Compuesta')
                .map(item => ({
                    idx: item.idx,
                    nombreArchivo: item.nombre_archivo || 'Vacío',
                    tipoNomina: 'Compuesta',
                    archivoNombre: item.nombre_archivo,
                    fechaCarga: item.fecha_carga,
                    userCarga: item.user_carga,
                    aprobado: item.aprobado,
                    aprobado2: item.aprobado2,
                }));

            setArchivos(data);
            setUploadedFiles(data.map(file => file.nombreArchivo).filter(name => name !== 'Vacío')); // ✅ Ahora aquí es correcto
            setIsUploadDisabled(data.length >= 2);
            setCanProcess(data.length >= 2);
            setIsProcessed(data.some((archivo) => archivo.aprobado && archivo.aprobado2));

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


    const formatDate = (value) => {
        if (!value) return '';
        const date = new Date(value);
        return `${date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const handleFileUpload = async () => {
        if (!fileToUpload) return;
        setIsLoading(true);
    
        try {
            const formData = new FormData();
            formData.append('file', fileToUpload);
            formData.append('extra', '');
    
            const uploadURL = `${API_BASE_URL}/SubirNomina?quincena=${quincena}&anio=${String(anio)}&tipo=Compuesta&usuario=${session || 'unknown'}`;
    
            await axios.post(uploadURL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(progress);
                },
            });
    
            setProgress(100);
            setUploaded(true);
            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Archivo subido correctamente.',
                life: 3000,
            });
    
            setUploadedFiles(prev => [...prev, fileToUpload.name]);
            setFileToUpload(null);
            setIsUploadDialogOpen(false); // 🔥 Cierra el modal después de subir correctamente
            fetchArchivosData();
    
        } catch (error) {
            console.error('Error uploading file', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error al Subir Archivo',
                detail: 'Hubo un error al subir el archivo.',
                life: 5000,
            });
        } finally {
            setIsLoading(false);
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
    
                await fetchArchivosData(); // 🔄 Asegurar que la tabla se actualice correctamente
                
                // 🔥 ACTUALIZAR LISTA DE ARCHIVOS
                setUploadedFiles(prevFiles => prevFiles.filter(file => file !== fileToDelete.nombreArchivo));
    
                // 🔥 ACTUALIZAR ESTADO PARA PERMITIR NUEVAS SUBIDAS
                setIsUploadDisabled(false); 
    
            } else {
                throw new Error(response.data || 'No se pudo eliminar el archivo.');
            }
        } catch (error) {
            console.error('Error al eliminar el archivo:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error al eliminar',
                detail: 'Hubo un problema al intentar eliminar el archivo.',
                life: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    // 🔥 SOLUCIÓN: Forzar actualización del `input` antes de seleccionar un archivo
    const handleFileSelection = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;
    
        setFileToUpload(selectedFile);
        setIsUploadDialogOpen(true);
    
        // 🔥 FORZAR REFRESCO DEL INPUT PARA PERMITIR SELECCIONAR EL MISMO ARCHIVO
        event.target.value = null;  
    };
    







    const handleFileDownload = async (idx, nombreArchivo) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/descargarNomina`, {
                params: { idx }, // Usamos idx para identificar el archivo
                responseType: 'blob', // Para manejar descargas de archivos
            });

            // Crear un enlace para descargar el archivo
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', nombreArchivo); // Nombre del archivo en la descarga
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Archivo "${nombreArchivo}" descargado correctamente.`,
                life: 3000,
            });
        } catch (error) {
            console.error('Error al descargar el archivo:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo descargar el archivo. Por favor, inténtelo más tarde.',
                life: 5000,
            });
        }
    };







    const handleProcesarNomina = async () => {
        setIsProcessing(true);
        try {
            const usuario = session || 'unknown';
            const endpoint = `${API_BASE_URL}/SubirNomina/dataBase?quincena=${quincena}&anio=${anio}&tipo=Compuesta&usuario=${usuario}&extra=gatitoverdecito`;

            const response = await axios.get(endpoint);

            if (response.status === 200) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Nómina procesada correctamente.',
                    life: 3000,
                });

                // Actualizar archivos: procesados pero no aprobados
                const updatedArchivos = archivos.map((archivo) => ({
                    ...archivo,
                    aprobado: false, // Deshabilita descarga
                    aprobado2: false, // Deshabilita descarga
                }));

                setArchivos(updatedArchivos); // Actualiza el estado local
                setIsProcessed(true); // Deshabilita "Procesar Nómina"
            } else {
                throw new Error('Error al procesar la nómina.');
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Hubo un error al procesar la nómina.',
                life: 5000,
            });
        } finally {
            setIsProcessing(false); // Oculta el overlay de carga
        }
    };







    const descargaTemplate = (rowData) => {
        // Deshabilitar descarga si no está aprobado
        const isDisabled = !rowData.aprobado || !rowData.aprobado2;

        return (
            <button
                className={styles.downloadButton}
                onClick={() => handleFileDownload(rowData.idx, rowData.nombreArchivo)}
                disabled={isDisabled} // Deshabilitar si no está aprobado
                title={isDisabled ? 'No se puede descargar, aún no está aprobado' : 'Descargar'}
            >
                <i className="pi pi-download"></i>
            </button>
        );
    };





    const deleteTemplate = (rowData) => {
        // Deshabilitar eliminación si el archivo está aprobado
        const isDisabled = rowData.aprobado && rowData.aprobado2;

        return (
            <button
                className={`${styles.deleteButton} ${isDisabled ? styles.disabledButton : ''}`}
                onClick={() => {
                    setFileToDelete(rowData);
                    setIsDeleteDialogOpen(true);
                }}
                disabled={isDisabled} // Deshabilita si está aprobado
                title={isDisabled ? 'No se puede eliminar, ya está aprobado' : ''}
            >
                <i className="pi pi-times"></i>
            </button>
        );
    };




    const handleConfirmUpload = async () => {
        setIsUploadDialogOpen(false); // Cierra el modal
        if (!fileToUpload) return;

        setIsLoading(true); // Activa el overlay de carga
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('extra', ''); // Parámetro adicional si es necesario

        const usuario = session || 'unknown'; // Usuario actual

        try {
            const response = await axios.post(
                `${API_BASE_URL}/SubirNomina?quincena=${quincena}&anio=${anio}&usuario=${usuario}&tipo=Compuesta`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: `Archivo subido correctamente: ${response.data.message}`,
                life: 3000,
            });

            setUploaded(true); // Notifica que el archivo fue subido
            fetchArchivosData(); // Actualiza los datos de la tabla
        } catch (error) {
            console.error('Error al subir el archivo', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error desconocido al subir el archivo.',
                life: 5000,
            });
        } finally {
            setIsLoading(false); // Desactiva el overlay de carga
            setFileToUpload(null); // Resetea el archivo seleccionado
        }
    };




    return (
        <div className={`card ${styles.card}`}>
            <Toast ref={toast} />
            <LoadingOverlay isLoading={isLoading || isProcessing}>
                <DataTable value={archivos} sortMode="multiple" className={styles.dataTable} paginator rows={10}>
                    <Column field="nombreArchivo" header="NOMBRE DE ARCHIVO" style={{ width: '30%' }} headerClassName={styles.customHeader}></Column>
                    <Column field="tipoNomina" header="TIPO DE NÓMINA" style={{ width: '20%' }} headerClassName={styles.customHeader}></Column>
                    <Column field="userCarga" header="USUARIO" style={{ width: '20%' }} headerClassName={styles.customHeader}></Column>
                    <Column field="fechaCarga" header="FECHA DE CARGA" body={(rowData) => formatDate(rowData.fechaCarga)} style={{ width: '20%' }} headerClassName={styles.customHeader}></Column>
                    <Column body={descargaTemplate} header="DESCARGA" style={{ width: '10%' }} headerClassName={styles.customHeader}></Column>
                    <Column body={deleteTemplate} header="ELIMINAR" style={{ width: '10%' }} headerClassName={styles.customHeader}></Column>
                </DataTable>


                <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                    <DialogTitle>¿Está seguro de eliminar este archivo?</DialogTitle>
                    <DialogActions>
                        <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleDeleteFile} color="error">Eliminar</Button>
                    </DialogActions>
                </Dialog>

                <div className={styles.uploadContainer}>
                    <Button
                        variant="contained"
                        component="label"
                        disabled={uploadedFiles.length >= 2}
                    >
                        Subir Nomina Compuesta
                        <input type="file" hidden onChange={handleFileSelection} accept=".xlsx" />
                    </Button>




                    {uploadedFiles.length === 2 && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleProcesarNomina}
                            disabled={isProcessed}
                        >
                            Procesar Nómina
                        </Button>
                    )}

                </div>
            </LoadingOverlay>

            <Dialog open={isUploadDialogOpen} onClose={() => setIsUploadDialogOpen(false)}>
                <DialogTitle>¿Desea subir los archivos seleccionados?</DialogTitle>
                <div style={{ padding: '1rem' }}>
                    <p>Archivos seleccionados:</p>
                    <ul>
                        {fileToUpload ? <li>{fileToUpload.name}</li> : <p>No hay archivo seleccionado</p>}
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