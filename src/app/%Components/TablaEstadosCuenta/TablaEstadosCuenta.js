'use client';
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './TablaEstadosCuenta.module.css';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Toast } from 'primereact/toast';
import API_BASE_URL from '../../%Config/apiConfig';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';

export default function TablaEstadosCuenta({ anio, quincena, session, setUploaded, mes }) {
    const toast = useRef(null);
    const fileInputRef = useRef(null); // Referencia al input tipo file
    const [estadosCuenta, setEstadosCuenta] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Controla la visibilidad del modal
    const [selectedFile, setSelectedFile] = useState(null); // Almacena el archivo seleccionado temporalmente

    // Carga los datos de los estados de cuenta al cambiar el año o la quincena
    useEffect(() => {
        if (anio && quincena) {
            fetchEstadosCuentaData();
        }
    }, [anio, quincena]);

    // Función para obtener los datos de los estados de cuenta desde la API
    const fetchEstadosCuentaData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/consultaEdoCta?anio=${anio}&mes=${mes}`);
            setEstadosCuenta(response.data); // Actualiza los datos de la tabla
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

    // Maneja la selección de archivo y abre el modal
    const handleFileSelect = (event) => {
        const file = event.target.files[0]; // Obtiene el archivo seleccionado
        if (file) {
            setSelectedFile(file); // Almacena el archivo en el estado
            setIsModalOpen(true); // Abre el modal de confirmación
            fileInputRef.current.value = ''; // Resetea el valor del input file
        }
    };

    // Confirma la subida del archivo al servidor
    const handleConfirmUpload = async () => {
        setIsModalOpen(false); // Cierra el modal
        if (!selectedFile) return;

        setIsLoading(true); // Muestra el overlay de carga
        const formData = new FormData();
        formData.append('file', selectedFile); // Añade el archivo al formData
        formData.append('extra', ''); // Agrega un parámetro adicional si es necesario

        const usuario = session || 'unknown'; // Usuario actual

        try {
            const response = await axios.post(
                `${API_BASE_URL}/SubirEdoCuenta?mes=${mes}&anio=${anio}&vuser=${usuario}&tipo_carga=EstadosCuenta`,
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
            fetchEstadosCuentaData(); // Actualiza los datos de la tabla
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
            setIsLoading(false); // Oculta el overlay de carga
            setSelectedFile(null); // Resetea el archivo seleccionado
        }
    };

    // Cancela la subida del archivo y cierra el modal
    const handleCancelUpload = () => {
        setIsModalOpen(false); // Cierra el modal
        setSelectedFile(null); // Limpia el archivo seleccionado
    };

    return (
        <LoadingOverlay isLoading={isLoading}>
            <div className={`card ${styles.card}`}>
                <Toast ref={toast} />

                {/* Tabla de datos */}
                <DataTable value={estadosCuenta} sortMode="multiple" paginator rows={10} className={styles.dataTable}>
                    <Column
                        field="nombre_archivo"
                        header="Nombre de archivo"
                        style={{ width: '30%' }}
                        headerStyle={{ backgroundColor: '#9b1d1d', color: 'white'}}
                    ></Column>
                    <Column
                        field="user_carga"
                        header="Usuario"
                        style={{ width: '20%' }}
                        headerStyle={{ backgroundColor: '#9b1d1d', color: 'white'}}
                    ></Column>
                    <Column
                        field="fecha_carga"
                        header="Fecha de carga" 
                        style={{ width: '10%' }}
                        headerStyle={{ backgroundColor: '#9b1d1d', color: 'white'}}
                    ></Column>
                </DataTable>

                {/* Botón para seleccionar un archivo */}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        component="label"
                        className={styles.uploadButton}
                    >
                        Subir Estados de Cuenta
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef} // Referencia al input
                            onChange={handleFileSelect} // Detecta cambios
                            accept=".xlsx"
                        />
                    </Button>
                </div>

                <Button className={styles.verInfo} Link href="/DatosEdoCuenta">
                        Ver informacion de Estados de Cuenta

                </Button>

                {/* Modal de confirmación */}
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
