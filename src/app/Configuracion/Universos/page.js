"use client";
import React, { useState, useRef } from "react";
import ReusableTable2 from "../../%Components/ReusableTable2/ReusableTable2";
import { Toast } from "primereact/toast";
import API_BASE_URL from "../../%Config/apiConfig";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const UniversosPage = () => {
  const toast = useRef(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [universoAEliminar, setUniversoAEliminar] = useState(null);

  const columns = [
    { label: "ID Universo", accessor: "id_universo", width: "30%" },
    { label: "Nombre Nómina", accessor: "nombre_nomina", width: "70%" },
  ];

  const fetchUniversos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cat/universos`);
      if (!response.ok) {
        throw new Error("Error al obtener los datos.");
      }
      return await response.json();
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Error al cargar universos.",
        life: 3000,
      });
      throw error;
    }
  };

  // ✅ Validar que el ID solo tenga letras (sin números)
  const validarID = (id) => /^[A-Za-z]+$/.test(id);

  // ✅ Crear universo con validaciones
  const handleCreateUniverso = async (newRow) => {
    if (!validarID(newRow.id_universo)) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "El ID debe contener solo letras (sin números).",
        life: 3000,
      });
      return false;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/insertarUniverso?id_universo=${newRow.id_universo}&nombre_nomina=${newRow.nombre_nomina}`,
        { method: "GET" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message.includes("duplicate key") || errorData.message.includes("llave duplicada")) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: `El ID "${newRow.id_universo}" ya existe.`,
            life: 3000,
          });
        } else {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: errorData.message || "Error al crear el universo.",
            life: 3000,
          });
        }
        return false;
      }

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Universo creado correctamente.",
        life: 3000,
      });

      return true;
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error en la conexión con el servidor.",
        life: 3000,
      });
      return false;
    }
  };

  // ✅ Actualizar universo
  const handleUpdateUniverso = async (editedRow) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/actualizarUniverso?id_universo=${editedRow.id_universo}&nombre_nomina=${editedRow.nombre_nomina}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el universo.");
      }

      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Universo actualizado correctamente.",
        life: 3000,
      });

      return true;
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Error al actualizar el universo.",
        life: 3000,
      });
      return false;
    }
  };

  // ✅ Confirmar eliminación
  const handleConfirmDelete = (id) => {
    setUniversoAEliminar(id);
    setDeleteModalOpen(true);
  };

  // ✅ Eliminar universo después de confirmación
  const handleDeleteUniverso = async () => {
    if (!universoAEliminar) return;

    try {
      const response = await fetch(`${API_BASE_URL}/eliminarUniverso?id_universo=${universoAEliminar}`, { method: "GET" });

      if (!response.ok) {
        throw new Error("Error al eliminar el universo.");
      }

      setDeleteModalOpen(false); // 🔴 Cierra el modal primero

      setTimeout(() => {
        toast.current.show({ 
          severity: "success", 
          summary: "Éxito", 
          detail: "Eliminado correctamente", 
          life: 3000 
        });
      }, 500);

    } catch (error) {
      setDeleteModalOpen(false);
      setTimeout(() => {
        toast.current.show({ 
          severity: "error", 
          summary: "Error", 
          detail: error.message || "Error al eliminar el universo.",
          life: 3000
        });
      }, 500);
    }

    setUniversoAEliminar(null);
  };

  return (
    <div>
      <Toast ref={toast} />

      <ReusableTable2
        columns={columns}
        fetchData={fetchUniversos}
        editable
        deletable
        insertable
        onEdit={handleUpdateUniverso}
        onDelete={handleConfirmDelete}
        onInsert={handleCreateUniverso}
      />

      {/* 🔴 MODAL DE CONFIRMACIÓN 🔴 */}
      <Dialog open={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar este universo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteUniverso} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UniversosPage;
