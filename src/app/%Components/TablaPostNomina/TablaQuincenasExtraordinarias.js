'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TablaQuincenasExtraordinarias.module.css';
import { Button, Select, MenuItem } from '@mui/material';
import { Toast } from 'primereact/toast';
import API_BASE_URL from '../../%Config/apiConfig';
import AsyncButton from '../AsyncButton/AsyncButton';
import LoadingOverlay from '../../%Components/LoadingOverlay/LoadingOverlay';
import { Dialog, DialogTitle, DialogActions } from '@mui/material';

const tiposExtraordinarios = [
    'DIA DE LA MUJER',
    'DIA DE LA MADRE',
    'DIA DEL PADRE',
    'SEPARACION VOLUNTARIA',
    'FONAC',
    'VESTUARIO ADMINISTRATIVO',
    'PREMIO DE ANTIGÜEDAD',
    'PREMIO DE ESTIMULOS Y RECOMPENSAS',
    'VALES DE DESPENSA NOMINA PAGADA EN VALES',
    'PAGO UNICO HONORARIOS',
    'AGUINALDO',
];

export default function TablaQuincenasExtraordinarias({ quincena, anio, session }) {
    const toast = useRef(null);
    const [extraordinarios, setExtraordinarios] = useState([]);
    const [selectedTipo, setSelectedTipo] = useState('');
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [canProcess, setCanProcess] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isUploadDisabled, setIsUploadDisabled] = useState(false);
    const [isProcessed, setIsProcessed] = useState(false); // Controla si la nómina fue procesada


    useEffect(() => {
        fetchExtraordinariosData();
    }, [anio, quincena]);

    const fetchExtraordinariosData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/consultaNominaCtrl/filtro`, {
                params: { anio, quincena, tipo: 'Extraordinarios' },
            });
    
            const data = response.data
                .filter(
                    (item) =>
                        item.nombre_nomina === 'Extraordinarios' &&
                        item.extra_desc &&
                        item.extra_desc.split(',').some((tipo) => tiposExtraordinarios.includes(tipo.trim()))
                )
                .map((item) => ({
                    idx: item.idx,
                    nombreArchivo: item.nombre_archivo || 'Vacío',
                    tipoNomina: 'Extraordinarios',
                    archivoNombre: item.nombre_archivo,
                    tipoExtraordinario: item.extra_desc || '',
                    userCarga: item.user_carga || 'Desconocido',
                    aprobado: item.aprobado,
                    aprobado2: item.aprobado2,
                }));
    
            setExtraordinarios(data);
    
            setIsUploadDisabled(data.length >= 2);
            setCanProcess(data.length >= 2);
            setIsProcessed(data.some((archivo) => archivo.aprobado && archivo.aprobado2)); // Aquí
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al cargar los archivos',
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
        if (!filesToUpload.length || !selectedTipo) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Selecciona los archivos y un tipo extraordinario antes de subir.',
                life: 3000,
            });
            return;
        }

        setIsLoading(true);
        setIsUploadDialogOpen(false);

        try {
            for (const file of filesToUpload) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('extra', selectedTipo);

                await axios.post(`${API_BASE_URL}/SubirNomina`, formData, {
                    params: {
                        quincena,
                        anio,
                        tipo: 'Extraordinarios',
                        usuario: session || 'unknown',
                        extra: selectedTipo,
                    },
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Archivos subidos correctamente.',
                life: 3000,
            });

            await fetchExtraordinariosData(); // Refrescar datos tras la subida
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al subir los archivos.',
                life: 5000,
            });
        } finally {
            setFilesToUpload([]); // Limpiar selección de archivos
            setSelectedTipo(''); // Reiniciar tipo extraordinario seleccionado
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
                await fetchExtraordinariosData(); // Refrescar datos tras la eliminación
            } else {
                throw new Error(response.data || 'No se pudo eliminar el archivo.');
            }
        } catch (error) {
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

    const handleFileDownload = async (archivoNombre, tipoExtraordinario) => {
        const nombreSinExtension = archivoNombre.replace(/\.[^/.]+$/, '');

        try {
            const response = await axios.get(`${API_BASE_URL}/download`, {
                params: {
                    quincena,
                    anio,
                    tipo: 'Extraordinarios',
                    nombre: nombreSinExtension,
                    extra: tipoExtraordinario,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', archivoNombre || `reporte_extraordinarios_${anio}_${quincena}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast.current.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Archivo descargado correctamente.',
                life: 3000,
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al descargar el archivo.',
                life: 3000,
            });
        }
    };

    const handleProcesarNomina = async () => {
        setIsLoading(true);
    
        try {
            const response = await axios.get(`${API_BASE_URL}/SubirNomina/dataBase`, {
                params: {
                    quincena,
                    anio,
                    tipo: 'Extraordinarios',
                    usuario: session || 'unknown',
                    extra: selectedTipo,
                },
            });
    
            if (response.status === 200) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Nómina extraordinaria procesada correctamente.',
                    life: 3000,
                });
    
                setExtraordinarios((prev) =>
                    prev.map((archivo) => ({
                        ...archivo,
                        aprobado: false, // Aquí
                        aprobado2: false,
                    }))
                );
                setIsProcessed(true); // Aquí
            } else {
                throw new Error('Error al procesar la nómina extraordinaria.');
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Error al procesar la nómina extraordinaria.',
                life: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };
    

    const descargaTemplate = (rowData) => (
        <button
            className={styles.downloadButton}
            onClick={() => handleFileDownload(rowData.archivoNombre, rowData.tipoExtraordinario)}
            disabled={!rowData.aprobado || !rowData.aprobado2}
            title={!rowData.aprobado || !rowData.aprobado2 ? 'No aprobado para descarga' : 'Descargar'}
        >
            <i className="pi pi-download"></i>
        </button>
    );
    

    const deleteTemplate = (rowData) => (
        <button
            className={`${styles.deleteButton} ${
                rowData.aprobado && rowData.aprobado2 ? styles.disabledButton : ''
            }`}
            onClick={() => {
                setFileToDelete(rowData);
                setIsDeleteDialogOpen(true);
            }}
            disabled={rowData.aprobado && rowData.aprobado2}
            title={rowData.aprobado && rowData.aprobado2 ? 'No se puede eliminar, ya está aprobado' : ''}
        >
            <i className="pi pi-times"></i>
        </button>
    );
    

    return (
        <div className={`card ${styles.card}`}>
            <Toast ref={toast} />
            <LoadingOverlay isLoading={isLoading}>
                <DataTable value={extraordinarios} className={styles.dataTable} paginator rows={10}>
                    <Column field="nombreArchivo" header="NOMBRE DE ARCHIVO" style={{ width: '30%' }} headerClassName={styles.customHeader}></Column>
                    <Column field="tipoNomina" header="TIPO DE NÓMINA" style={{ width: '20%' }} headerClassName={styles.customHeader}></Column>
                    <Column field="tipoExtraordinario" header="TIPO EXTRAORDINARIO" style={{ width: '25%' }} headerClassName={styles.customHeader}></Column>
                    <Column field="userCarga" header="USUARIO" style={{ width: '15%' }} headerClassName={styles.customHeader}></Column>
                    <Column body={descargaTemplate} header="DESCARGA" style={{ width: '5%' }} headerClassName={styles.customHeader}></Column>
                    <Column body={deleteTemplate} header="ELIMINAR" style={{ width: '5%' }} headerClassName={styles.customHeader}></Column>
                </DataTable>

                <div className={styles.controls}>
                    <Select
                        value={selectedTipo}
                        onChange={(e) => setSelectedTipo(e.target.value)}
                        variant="outlined"
                        displayEmpty
                        className={styles.select}
                        disabled={isUploadDisabled}
                    >
                        <MenuItem value="" disabled>
                            Selecciona tipo extraordinario para subir
                        </MenuItem>
                        {tiposExtraordinarios.map((tipo) => (
                            <MenuItem key={tipo} value={tipo}>
                                {tipo}
                            </MenuItem>
                        ))}
                    </Select>

                    <Button
                        variant="contained"
                        component="label"
                        className={`${styles.uploadButton} ${!selectedTipo || isUploadDisabled ? styles.disabledButton : ''}`}
                        disabled={!selectedTipo || isUploadDisabled}
                    >
                        Subir Nómina Extraordinaria
                        <input type="file" hidden onChange={handleFileSelection} accept=".xlsx" multiple />
                    </Button>

                    {canProcess && (
                        <AsyncButton>
                            <Button
                                variant="contained"
                                className={styles.procesarButton}
                                onClick={handleProcesarNomina}
                            >
                                Procesar Nómina Extraordinaria
                            </Button>
                        </AsyncButton>
                    )}
                </div>
            </LoadingOverlay>

            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogTitle>¿Está seguro de eliminar este archivo?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteFile} color="error">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isUploadDialogOpen} onClose={() => setIsUploadDialogOpen(false)}>
                <DialogTitle>¿Desea subir estos archivos?</DialogTitle>
                <div style={{ padding: '1rem' }}>
                    <ul>
                        {filesToUpload.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                </div>
                <DialogActions>
                    <Button onClick={() => setIsUploadDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleFileUpload} color="primary">
                        Subir
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
