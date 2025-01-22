"use client";

import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from './Tablas.module.css';

export default function ImporteLiquido({ importeLiquidoData }) {
    const diferenciaTemplate = (rowData) => {
        return <span className={styles.diferenciaText}>{rowData.diferencia.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>;
    };

    return (
        <div className={`card ${styles.card}`}>
            <div className="flex justify-content-between align-items-center mb-4">
                <h2 className={styles.header}>IMPORTE LIQUIDO - RETENCIONES DE DEPOSITO</h2>
            </div>
            <DataTable value={importeLiquidoData} paginator={false} rows={10} className="p-datatable-sm">
                <Column field="importeLiquidoTotal" header="IMPORTE LIQUIDO TOTAL" sortable body={data => data.importeLiquidoTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}></Column>
                <Column field="retencionesDeposito" header="RETENCIONES DE DEPOSITO" sortable body={data => data.retencionesDeposito.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}></Column>
                <Column field="diferencia" header="DIFERENCIA" sortable body={diferenciaTemplate}></Column>
            </DataTable>
        </div>
    );
}
