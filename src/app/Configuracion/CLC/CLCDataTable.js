import React from 'react';
import { Button } from '@mui/material';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function CLCDataTable({ data, dateData, refreshTable }) {
  const handlePDFDownload = async (nombreArchivo) => {
    const { mes, anio } = dateData;

    try {


      // Asegurarse de que solo se envíe el nombre del archivo
      const nombreArchivoLimpio = nombreArchivo.split('/').pop().split('.').slice(0, -1).join('.');

      // Descargar el archivo
      const response = await fetch(
        `http://192.168.100.25:7080/Nomina/download/CLCs?mes=${mes}&anio=${anio}&tipo=CLC&nombre=${encodeURIComponent(
          nombreArchivoLimpio
        )}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) throw new Error('Error al descargar el archivo.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nombreArchivoLimpio}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el PDF:', error.message);
    }
  };

  return (
    <DataTable value={data} paginator rows={5} responsiveLayout="scroll">
      <Column field="id" header="ID" />
      <Column field="fecha_operacion" header="Fecha Operación" />
      <Column field="codigo" header="Código" />
      <Column
        field="monto_bruto"
        header="Monto Bruto"
        body={(rowData) =>
          rowData.monto_bruto
            ? rowData.monto_bruto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
            : 'N/A'
        }
      />
      <Column field="concepto" header="Concepto" />
      <Column field="fecha_registro" header="Fecha Registro" />
      <Column
        field="comentario"
        header="Comentario"
        body={(rowData) => (rowData.comentario ? rowData.comentario : 'Sin comentario')}
      />
      <Column
        header="Evidencia"
        body={(rowData) =>
          rowData.evidencia ? (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => handlePDFDownload(rowData.evidencia)}
            >
              Ver PDF
            </Button>
          ) : (
            'Sin evidencia'
          )
        }
      />
    </DataTable>
  );
}
