import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Toast } from 'primereact/toast';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import API_BASE_URL from '../../%Config/apiConfig';
import styles from './ComparativeTable.module.css';
import AsyncButton from '../AsyncButton/AsyncButton';

const ComparativaTable = ({ userRevision, quincena, anio }) => {  
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true); // Estado para controlar la recarga
    const toast = useRef(null);
    const dt = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true); // Iniciar la carga
            const response = await axios.get(`${API_BASE_URL}/filtrarNominaCtrl`, {
                params: {
                    quincena: quincena,
                    anio: anio
                }
            });
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching data', error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error fetching data', life: 3000 });
        } finally {
            setLoading(false); // Finalizar la carga
        }
    };

    useEffect(() => {
        if (quincena && anio) {
            fetchData();
        }
    }, [quincena, anio]);

    const approveTemplate = (rowData) => {
        return (
            <div className="p-field-radiobutton">
                <RadioButton 
                    inputId={`approve${rowData.idx}`} 
                    name={rowData.idx} 
                    value="Aprobar" 
                    onChange={(e) => onRadioChange(e, rowData)} 
                    checked={rowData.status === 'Aprobar'} 
                />
                <label htmlFor={`approve${rowData.idx}`}>Aprobar</label>
                <RadioButton 
                    inputId={`cancel${rowData.idx}`} 
                    name={rowData.idx} 
                    value="Cancelar" 
                    onChange={(e) => onRadioChange(e, rowData)} 
                    checked={rowData.status === 'Cancelar'} 
                />
                <label htmlFor={`cancel${rowData.idx}`}>Cancelar</label>
            </div>
        );
    };

    const onRadioChange = (e, rowData) => {
        let updatedRecords = [...records];
        let recordIndex = updatedRecords.findIndex(record => record.idx === rowData.idx);
        
        // Si el usuario selecciona "Cancelar", pendiente_dem debe cambiar a false
        updatedRecords[recordIndex] = { 
            ...rowData, 
            status: e.value, 
            pendiente_dem: e.value === 'Cancelar' ? false : rowData.pendiente_dem 
        };
        setRecords(updatedRecords);
    };

    const handleConfirm = async () => {
        const confirmed = window.confirm("¿Son correctos los datos?");
        if (!confirmed) {
            return;
        }

        const updatePromises = records.map(async (record) => {
            if (!record.status) {
                return; // No actualizar los registros que no tienen un estado seleccionado
            }
            const params = new URLSearchParams({
                cancelado: record.status === 'Cancelar',
                aprobado: record.status === 'Aprobar',
                user_revision: userRevision,
                rol_user: 'Admin',
                pendiente_dem: record.pendiente_dem,  // Aquí se pasa el valor actualizado
                idx: record.idx
            }).toString();

            try {
                await axios.get(`${API_BASE_URL}/validarNominaCtrl1?${params}`);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: `Estado de la nómina ${record.idx} actualizado correctamente`, life: 3000 });
            } catch (error) {
                console.error('Error updating record', error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: `Error al actualizar la nómina ${record.idx}`, life: 3000 });
            }
        });

        await Promise.all(updatePromises.filter(Boolean)); // Filtrar las promesas nulas

        fetchData(); // Recargar los datos después de confirmar
    };

    

   
    

    return (
        <div>
            <Toast ref={toast} />
            
            
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <DataTable ref={dt} value={records} responsiveLayout="scroll" >
                    <Column field="idx" header="Idx"  headerClassName={styles.headerRed}/>
                    <Column field="anio" header="Año"  headerClassName={styles.headerRed} />
                    <Column field="quincena" header="Quincena"  headerClassName={styles.headerRed}/>
                    <Column field="nombre_nomina" header="Nombre Nómina"  headerClassName={styles.headerRed}/>
                    <Column field="nombre_archivo" header="Nombre Archivo"  headerClassName={styles.headerRed}/>
                    <Column field="fecha_carga" header="Fecha Carga"  headerClassName={styles.headerRed}/>
                    <Column field="user_carga" header="Usuario Carga"  headerClassName={styles.headerRed}/>
                    <Column body={approveTemplate} header="Acción" headerClassName={styles.headerRed}/>
                </DataTable>
            )}
              <br></br>
            <AsyncButton
             className={styles.button} 
             label='Confirmar' 
             type="button" 
             icon="pi pi-check" 
             severity="success" 
             onClick={handleConfirm} >
                Confirmar
                </AsyncButton>
        </div>
    );
};

export default ComparativaTable;
