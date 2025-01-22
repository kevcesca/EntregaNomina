"use client";
import React, { useState } from "react";
import ReusableTable2 from "../../%Components/ReusableTable2/ReusableTable2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "../../%Config/apiConfig";

const UniversosPage = () => {
  const columns = [
    { label: "ID Universo", accessor: "id_universo" },
    { label: "Nombre Nómina", accessor: "nombre_nomina" },
  ];
  
  const fetchUniversos = async () => {
    const response = await fetch(`${API_BASE_URL}/cat/universos`);
    const data = await response.json();
    return data;
  };

  const handleCreateUniverso = async (newRow) => {
    const response = await fetch(`${API_BASE_URL}/insertarUniverso?id_universo=${newRow.id_universo}&nombre_nomina=${newRow.nombre_nomina}`, { method: "GET" });
    return response.ok;
  };

  const handleUpdateUniverso = async (editedRow) => {
    const response = await fetch(`${API_BASE_URL}/actualizarUniverso?id_universo=${editedRow.id_universo}&nombre_nomina=${editedRow.nombre_nomina}`, { method: "GET" });
    return response.ok;
  };

  const handleDeleteUniverso = async (id) => {
    const response = await fetch(`${API_BASE_URL}/eliminarUniverso?id_universo=${id}`, { method: "GET" });
    return response.ok;
  };

  return (
    <div>
      <ReusableTable2
        columns={columns}
        fetchData={fetchUniversos}
        editable
        deletable
        insertable
        onEdit={handleUpdateUniverso}
        onDelete={handleDeleteUniverso}
        onInsert={handleCreateUniverso}
      />
    </div>
  );
};

export default UniversosPage;
