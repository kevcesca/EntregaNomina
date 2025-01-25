'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TablaRetenciones.module.css';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Toast } from 'primereact/toast';
import API_BASE_URL from '../../%Config/apiConfig';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'; // Importar el componente LoadingOverlay

export default function TablaRetenciones({ anio, quincena, session, setUploaded }) {
    const toast = useRef(null);
    const [dispersiones, setDispersiones] = useState([]); // Estado para guardar los datos de la tabla
    const [isLoading, setIsLoading] = useState(false); // Estado para manejar el LoadingOverlay
    const [isModalOpen, setIsModalOpen] = useState(false); // Controla la visibilidad del modal
    const [selectedFile, setSelectedFile] = useState(null); // Almacena el archivo seleccionado temporalmente
    const fileInputRef = useRef(null); // Referencia al input tipo file


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

    const handleFileSelect = (event) => {
        const file = event.target.files[0]; // Obtiene el archivo seleccionado
        if (file) {
            setSelectedFile(file); // Almacena el archivo en el estado
            setIsModalOpen(true); // Abre el modal de confirmación
            fileInputRef.current.value = ''; // Resetea el valor del input file
        }
    };

    const handleConfirmUpload = async () => {
        setIsModalOpen(false); // Cierra el modal
        if (!selectedFile) return;

        setIsLoading(true); // Activa el overlay de carga
        const formData = new FormData();
        formData.append('file', selectedFile); // Añade el archivo al formData
        formData.append('extra', ''); // Agrega un parámetro adicional si es necesario

        const usuario = session || 'unknown'; // Usuario actual

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
                detail: `Archivo subido correctamente: ${response.data.message || selectedFile.name}`,
                life: 3000,
            });

            setUploaded(true); // Notifica que el archivo fue subido
            fetchDispersionesData(); // Actualiza los datos de la tabla
        } catch (error) {
            console.error('Error al subir el archivo', error);
            const errorMessage = error.response?.data?.message || 'Error desconocido al subir el archivo.';

            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: `Error al subir el archivo: ${errorMessage}`,
                life: 3000,
            });
        } finally {
            setIsLoading(false); // Desactiva el overlay de carga
            setSelectedFile(null); // Resetea el archivo seleccionado
        }
    };

    const handleCancelUpload = () => {
        setIsModalOpen(false); // Cierra el modal
        setSelectedFile(null); // Limpia el archivo seleccionado
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
                detail: `Error al subir el archivo: ${error.response?.data?.message || error.message
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
                <DataTable value={dispersiones} sortMode="multiple" paginator rows={10} className={styles.dataTable}>
                    <Column
                        field="nombreArchivo"
                        header="Nombre de archivo"
                        style={{ width: '50%' }}
                        headerStyle={{ backgroundColor: '#9b1d1d', color: 'white'}}
                    ></Column>
                    <Column
                        field="quincena"
                        header="Quincena"
                        style={{ width: '25%' }}
                        headerStyle={{ backgroundColor: '#9b1d1d', color: 'white'}}
                    ></Column>
                </DataTable>

                {/* Botón para subir un archivo */}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        component="label"
                        className={styles.uploadButton}
                    >
                        Subir nuevo archivo
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef} // Añade la referencia
                            onChange={handleFileSelect} // Usa la nueva función
                            accept=".xlsx, .xlx"
                        />
                    </Button>

                </div>

                
                <Button className={styles.verInfo} Link href="/DatosDispersiones">
                        Ver informacion de Dispersiones
                </Button>

                <Dialog
                    open={isModalOpen} // Controla la visibilidad del modal
                    onClose={handleCancelUpload} // Maneja el cierre del modal
                    aria-labelledby="confirm-upload-dialog"
                >
                    <DialogTitle id="confirm-upload-dialog">Confirmar Subida de Archivo</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            ¿Estás seguro de que deseas subir el archivo seleccionado? <br />
                            <strong>{selectedFile?.name}</strong> {/* Muestra el nombre del archivo */}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelUpload} color="secondary">
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmUpload} color="primary" autoFocus>
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>

            </div>
        </LoadingOverlay>
    );
}
