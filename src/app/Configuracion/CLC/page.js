'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, Typography, Box } from '@mui/material';
import { Toast } from 'primereact/toast';
import theme from '../../$tema/theme';
import styles from './page.module.css';
import CLCForm from './CLCForm';
import CLCDataTable from './CLCDataTable';
import DateFilter from '../../%Components/DateFilter/DateFilter';;
import API_BASE_URL from '../../%Config/apiConfig';
import { Alert } from '@mui/material'; // Importar Alert de Material-UI

export default function VerificacionCLC() {
  const [data, setData] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [selectedCLC, setSelectedCLC] = useState('');
  const [dateData, setDateData] = useState({
    anio: new Date().getFullYear(),
    mes: (new Date().getMonth() + 1).toString().padStart(2, '0'),
  });

  const [formData, setFormData] = useState({
    id: '',
    fechaOperacion: '',
    codigo: '',
    montoBruto: '',
    comentario: '',
    evidencia: null,
    evidenciaNombre: 'No se ha seleccionado ningún archivo',
  });

  const toast = useRef(null);

  // Servicio para obtener los conceptos disponibles
  const fetchConceptos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/CLC/visualizar?concepto=CLC`);
      if (!response.ok) throw new Error('Error al obtener conceptos');
      const result = await response.json();
      setConceptos(result.map((item) => item.concepto.trim()));
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
    }
  };

  // Servicio para obtener los detalles del concepto seleccionado
  const fetchCLCDetails = async (concepto) => {
    try {
      const response = await fetch(`${API_BASE_URL}/CLC/visualizar?concepto=${concepto}`);
      if (!response.ok) throw new Error('Error al obtener detalles del concepto CLC');
      const result = await response.json();
      const clc = result.find((item) => item.concepto.trim() === concepto);

      if (!clc) throw new Error('Concepto CLC no encontrado.');

      setFormData((prevData) => ({
        ...prevData,
        id: clc.id_edocta,
        fechaOperacion: clc.fecha_operacion,
        codigo: clc.codigo.trim(),
        montoBruto: clc.monto_bruto,
      }));
      setSelectedCLC(concepto);
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
    }
  };

  // Servicio para obtener los datos de la tabla en base al calendario
  const fetchCLCData = async ({ anio, mes }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/verificacionClc?mes=${mes}&anio=${anio}`
      );

      if (!response.ok) throw new Error('Error al obtener datos de verificación CLC.');

      const result = await response.json();

      const formattedData = result.map((item) => ({
        id: item.id_edocta,
        fecha_operacion: item.fecha_op,
        codigo: item.codigo,
        monto_bruto: item.monto_bruto,
        concepto: item.concepto,
        fecha_registro: new Date(item.fecha_registro).toISOString().split('T')[0],
        comentario: item.descripcion,
        evidencia: item.evidencia_pdf, // Ruta completa al archivo
      }));

      setData(formattedData);
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
    }
  };

  // Actualizar datos al cambiar la fecha
  const handleDateChange = (dateInfo) => {
    const mes = (dateInfo.fechaSeleccionada.getMonth() + 1).toString().padStart(2, '0');
    const anio = dateInfo.anio;
    setDateData({ anio, mes });
    fetchCLCData({ anio, mes });
  };

  const handleFieldChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        evidencia: e.target.files[0],
        evidenciaNombre: e.target.files[0].name,
      }));
    }
  };

  const handleAgregarCLC = async () => {
    if (!formData.evidencia) {
      toast.current.show({ severity: 'warn', summary: 'Validación', detail: 'Selecciona un archivo' });
      return;
    }

    try {
      const { anio, mes } = dateData;
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.evidencia);

      // Servicio para subir el archivo
      const uploadResponse = await fetch(
        `${API_BASE_URL}/SubirCLCs?quincena=${mes}&anio=${anio}&vuser=kevin&tipo_carga=CLC`,
        {
          method: 'POST',
          body: formDataToSend,
        }
      );

      if (!uploadResponse.ok) throw new Error('Error al subir el archivo.');

      const uploadResult = await uploadResponse.json();
      const { fileName } = uploadResult;

      // Servicio para validar el archivo
      const parametroBusqueda = `${selectedCLC}`;
      const descripcion = formData.comentario;

      const validateResponse = await fetch(
        `${API_BASE_URL}/validarEdocta?parametroBusqueda=${encodeURIComponent(
          parametroBusqueda
        )}&descripcion=${encodeURIComponent(descripcion)}&evidenciaPdf=${encodeURIComponent(fileName)}`,
        {
          method: 'GET',
        }
      );

      if (!validateResponse.ok) throw new Error('Error al validar el archivo.');

      const newRecord = {
        ...formData,
        evidencia: URL.createObjectURL(formData.evidencia),
        fecha_registro: new Date().toISOString().split('T')[0],
        evidenciaNombre: fileName,
      };

      setData([...data, newRecord]);

      toast.current.show({
        severity: 'success',
        summary: 'CLC Agregada',
        detail: 'Archivo subido y validado correctamente.',
      });

      // Limpiar el formulario
      setFormData({
        id: '',
        fechaOperacion: '',
        codigo: '',
        montoBruto: '',
        comentario: '',
        evidencia: null,
        evidenciaNombre: 'No se ha seleccionado ningún archivo',
      });
      setSelectedCLC('');
      // Refrescar los datos de la tabla antes de proceder
      refreshTable();
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: error.message });
    }
  };

  const refreshTable = async () => {
    await fetchCLCData(dateData);
  };

  useEffect(() => {
    fetchConceptos();
    fetchCLCData(dateData); // Cargar datos de la tabla al iniciar
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.container}>
        <Toast ref={toast} />
        <Typography variant="h4" gutterBottom>
          Verificación de CLC
        </Typography>

        {/* Mensaje de advertencia */}
        <Alert severity="info" sx={{ width: "26vw", textAlign: "center", marginBottom: "1rem" }}>
                Selecciona un mes y dia antes de buscar un concepto de CLC".
            </Alert>

        {/* Componente de filtro de fecha */}
        <DateFilter onDateChange={handleDateChange} />

        {/* Formulario para agregar CLC */}
        <CLCForm
          conceptos={conceptos}
          selectedCLC={selectedCLC}
          onConceptoChange={fetchCLCDetails}
          onFieldChange={handleFieldChange}
          formData={formData}
          onFileChange={handleFileChange}
          handleAgregarCLC={handleAgregarCLC}
        />

        {/* Tabla de datos */}
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Lista de CLCs
          </Typography>
          <CLCDataTable data={data} dateData={dateData} refreshTable={refreshTable} />
        </Box>
      </div>
    </ThemeProvider>
  );
}
