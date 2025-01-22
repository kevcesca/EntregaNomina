// src/components/AsyncButton.js
'use client';

import React, { useState } from 'react';
import { Button } from '@mui/material';

const AsyncButton = ({ onClick, children, ...props }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (event) => {
    if (isLoading) return; // Evitar clics múltiples si ya está en proceso
    setIsLoading(true); // Deshabilitar el botón
    try {
      // Ejecutar la acción pasada como prop
      await onClick(event);
    } catch (error) {
      console.error("Error during async operation:", error);
    } finally {
      // Después de 2 segundos, habilitar nuevamente el botón
      setTimeout(() => setIsLoading(false), 2000); 
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading} // El botón se deshabilita durante el proceso
      {...props} // Permite pasar cualquier prop adicional (ej. color, variant)
    >
      {isLoading ? 'Cargando...' : children} {/* Si está en carga, muestra "Cargando..." */}
    </Button>
  );
};

export default AsyncButton;
