"use client";
import React, { useState } from 'react';
import ReusableTable from '../../%Components/ReusableTable/ReusableTable'; // Ajusta la ruta según sea necesario
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importar estilos
import API_BASE_URL from '../../%Config/apiConfig';
import { Alert } from '@mui/material'; // Importar Alert de Material-UI

const ConceptosPage = () => {
    const [data, setData] = useState([]);
    const columns = [
        { label: 'ID Concepto', accessor: 'id_concepto' },
        { label: 'Nombre Concepto', accessor: 'nombre_concepto' },
    ];

    // Función para obtener la lista de conceptos
    const fetchConceptos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/cat/conceptos`);
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || "Error al obtener los conceptos";
                throw new Error(errorMessage);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
            // Se propaga el error para que sea capturado por el useEffect en ReusableTable
            throw error;
        }
    };

    // Función para crear un nuevo concepto
    const handleCreateConcepto = async (newRow) => {
        const response = await fetch(
            `${API_BASE_URL}/insertarConcepto?id_concepto=${newRow.id_concepto}&nombre_concepto=${newRow.nombre_concepto}`,
            { method: 'GET' }
        );
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.message || 'Error al crear el concepto';
            throw new Error(errorMessage);
        }
        return true;
    };

    // Función para actualizar un concepto existente
    const handleUpdateConcepto = async (editedRow) => {
        const response = await fetch(
            `${API_BASE_URL}/actualizarConcepto?id_concepto=${editedRow.id_concepto}&nombre_concepto=${editedRow.nombre_concepto}`,
            { method: 'GET' }
        );
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.message || 'Error al actualizar el concepto';
            throw new Error(errorMessage);
        }
        return true;
    };

    // Función para eliminar un concepto
    const handleDeleteConcepto = async (id) => {
        const response = await fetch(
            `${API_BASE_URL}/eliminarConcepto?id_conceptos=${id}`,
            { method: 'GET' }
        );
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.message || 'Error al eliminar el concepto';
            throw new Error(errorMessage);
        }
        return true;
    };

    return (
        <div>
            {/* Mensaje de advertencia */}
            <Alert severity="info" sx={{ width: "31vw", textAlign: "center" }}>
                Para actualizar el concepto se debe presionar doble click encima de la tabla.
            </Alert>
            <ReusableTable
                columns={columns}
                fetchData={fetchConceptos}
                editable
                deletable
                insertable
                onEdit={handleUpdateConcepto}
                onDelete={handleDeleteConcepto}
                onInsert={handleCreateConcepto}
            />
        </div>
    );
};

export default ConceptosPage;