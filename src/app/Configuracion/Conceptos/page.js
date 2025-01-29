"use client";
import React, { useState, useRef} from 'react';
import ReusableTable from '../../%Components/TablaConceptos/ReusableTable'; // Ajusta la ruta según sea necesario
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importar estilos
import API_BASE_URL from '../../%Config/apiConfig';
import { Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'; // Importar Alert y Modal
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Toast } from "primereact/toast";


const ConceptosPage = () => {
    const [data, setData] = useState([]);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [conceptoAEliminar, setConceptoAEliminar] = useState(null); // Guarda el ID del concepto a eliminar
    const toast = useRef(null); 

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
                throw new Error(errorData.message || "Error al obtener los conceptos");
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    // Función para crear un nuevo concepto
    const handleCreateConcepto = async (newRow) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/insertarConcepto?id_concepto=${newRow.id_concepto}&nombre_concepto=${newRow.nombre_concepto}`,
                { method: "GET" }
            );
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al crear el concepto");
            }
    
            setTimeout(() => {
                if (toast.current) {
                    toast.current.show({
                        severity: "success",
                        summary: "Éxito",
                        detail: "Concepto creado correctamente.",
                        life: 3000,
                    });
                }
            }, 200);
    
            return true;
        } catch (error) {
            let errorMessage = error.message || "Error al crear el concepto.";
    
            // 🛑 Detectar si es un error de clave duplicada
            if (
                errorMessage.includes("duplicate key") ||
                errorMessage.includes("llave duplicada")
            ) {
                const match = errorMessage.match(/id_concepto\)=\((\d+)\)/);
                const idDuplicado = match ? match[1] : "desconocido";
                errorMessage = `El ID ${idDuplicado} ya existe.`;
            }
    
            // ✅ Evitar que se muestre el mensaje SQL completo
            setTimeout(() => {
                if (toast.current) {
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: errorMessage, // ✅ Solo mostrar el mensaje limpio
                        life: 5000,
                    });
                }
            }, 200);
    
            console.error("🔥 Error detectado:", errorMessage); // ✅ Solo loguear el error completo en la consola
    
            throw error;
        }
    };
    
    

    // Función para actualizar un concepto existente
    const handleUpdateConcepto = async (editedRow) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/actualizarConcepto?id_concepto=${editedRow.id_concepto}&nombre_concepto=${editedRow.nombre_concepto}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el concepto');
            }

            toast.success("Concepto actualizado correctamente.");
            return true;
        } catch (error) {
            toast.error(error.message || "Error al actualizar el concepto.");
            throw error;
        }
    };

     // ✅ Detectar errores de clave duplicada
  const handleError = (error) => {
    let errorMessage = error.message || "Error desconocido";

    if (
      errorMessage.includes("duplicate key") ||
      errorMessage.includes("llave duplicada")
    ) {
      errorMessage = "El ID o Nombre ingresado ya existe. Intenta con otro valor.";
    }

    setTimeout(() => {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 5000,
      });
    }, 100);
  };

     // ✅ Abrir el modal antes de eliminar
  const handleConfirmDelete = (id) => {
    setConceptoAEliminar(id);
    setDeleteModalOpen(true);
  };

  // ✅ Eliminar concepto después de la confirmación en el modal
  const handleDeleteConcepto = async () => {
    if (!conceptoAEliminar) return;

    setDeleteModalOpen(false); // ✅ Cierra el modal antes de continuar

    try {
      const response = await fetch(
        `${API_BASE_URL}/eliminarConcepto?id_conceptos=${conceptoAEliminar}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Error al eliminar el concepto");

      setConceptoAEliminar(null);

      // ✅ Actualizar datos después de eliminar
      const updatedData = await fetchConceptos();
      setData(updatedData);

      // ✅ Mostrar toast después de cerrar el modal con un pequeño delay
      setTimeout(() => {
        if (toast.current) {
          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Concepto eliminado correctamente.",
            life: 3000,
          });
        } else {
          console.error("❌ ERROR: Toast no está inicializado");
        }
      }, 100);

    } catch (error) {
      setTimeout(() => {
        if (toast.current) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error.message || "Error al eliminar el concepto.",
            life: 3000,
          });
        } else {
          console.error("❌ ERROR: Toast no está inicializado");
        }
      }, 100);
    }
  };

  return (
    <div>
      {/* ✅ Toast de PrimeReact */}
      <Toast ref={toast} position="top-right" />
            {/* Mensaje de advertencia */}
            <Alert severity="info" sx={{ width: "31vw", textAlign: "center" }}>
                Para actualizar el concepto se debe presionar doble click encima de la tabla.
            </Alert>

            {/* Tabla reutilizable */}
            <ReusableTable
                columns={columns}
                fetchData={fetchConceptos}
                editable
                deletable
                insertable
                onEdit={handleUpdateConcepto}
                onDelete={handleConfirmDelete} // Ahora abre el modal antes de eliminar
                onInsert={handleCreateConcepto}
            />

            {/* 🔴 MODAL DE CONFIRMACIÓN 🔴 */}
          <Dialog open={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            {conceptoAEliminar
              ? `¿Estás seguro de que deseas eliminar el concepto con ID ${conceptoAEliminar}?`
              : "¿Estás seguro de que deseas eliminar este concepto?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConcepto} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
        </div>
    );
};

export default ConceptosPage;
