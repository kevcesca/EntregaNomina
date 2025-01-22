import React, { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import styles from "./CrudRoles.module.css";
import CreateRoleModal from "./CreateRolModal";
import ConfirmationModal from "./ConfirmationModal";
import AsyncButton from "../AsyncButton/AsyncButton";
import ExportTableModal from "../CrudRoles/Components/ExportModalRoles"; // Importamos el componente reutilizable

const Toolbar = ({ selectedRoles, onDeleteSelected, disableDelete, onRoleCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // Estado para el modal de exportación
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Esquema de columnas para el modal de exportación
  const columns = [
    { label: "ID", accessor: "id" },
    { label: "Nombre", accessor: "name" },
    { label: "Descripción", accessor: "description" },
    { label: "Permisos", accessor: "permissions" },
  ];

  const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const handleExportOpen = () => {
    setIsExportModalOpen(true);
    handleMenuClose();
  };

  const handleExportClose = () => setIsExportModalOpen(false);

  // Exportar a CSV (deprecated: ahora usa ExportTableModal)
  const handleExportCSV = () => {
    console.warn("Esta función ahora se maneja con ExportTableModal");
    handleExportOpen();
  };

  // Validar creación de rol
  const handleValidateCreateRole = () => setIsValidationModalOpen(true);

  const handleDeleteRole = () => {
    if (!selectedRoles || selectedRoles.length === 0) {
      setIsValidationModalOpen(true);
      return;
    }
    setRoleToDelete(selectedRoles[0]);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRole = () => {
    onDeleteSelected(roleToDelete);
    setIsDeleteModalOpen(false);
    setRoleToDelete(null);
  };

  return (
    <div className={styles.toolbar}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsModalOpen(true)}
      >
        Crear Rol
      </Button>

      <Button
        variant="contained"
        color="secondary"
        onClick={() => handleExportOpen()}
        disabled={!selectedRoles || !selectedRoles.length}
      >
        Exportar
      </Button>
      

      <AsyncButton
        variant="contained"
        color="secondary"
        onClick={handleDeleteRole}
        disabled={disableDelete}
      >
        Eliminar seleccionados
      </AsyncButton>

      {/* Modal de validación para crear rol */}
      <ConfirmationModal
        isOpen={isValidationModalOpen}
        title="Validación de Campos"
        message="Por favor, selecciona al menos un permiso antes de crear el rol."
        onConfirm={() => setIsValidationModalOpen(false)}
        confirmText="Aceptar"
      />

      {/* Modal para eliminar un rol */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Eliminar Rol"
        message={`¿Estás seguro de que deseas eliminar el rol "${roleToDelete?.name}"?`}
        onConfirm={confirmDeleteRole}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal para crear un rol */}
      <CreateRoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoleCreated={onRoleCreated}
        resetOnOpen
      />

      {/* Modal de exportación */}
      <ExportTableModal
        open={isExportModalOpen}
        onClose={handleExportClose}
        rows={selectedRoles || []} // Pasa los roles seleccionados
        columns={columns} // Pasa el esquema de columnas
      />
    </div>
  );
};

export default Toolbar;
