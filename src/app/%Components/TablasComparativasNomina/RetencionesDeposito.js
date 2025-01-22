"use client";

import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import styles from "./Tablas.module.css";

export default function RetencionesDeposito({ retencionesDepositoData }) {
    const empleadoTemplate = (rowData) => {
        return <span className={styles.boldText}>{rowData.empleado}</span>;
    };

    const totalRealTemplate = (rowData) => {
        return <span className={styles.boldText}>{rowData.totalReal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>;
    };

    return (
        <div className={`card ${styles.card}`}>
            <div className="flex justify-content-between align-items-center mb-4 mt-4">
                <h2 className={styles.header}>RETENCIONES</h2>
            </div>
            <DataTable value={retencionesDepositoData} paginator={false} rows={10} className="p-datatable-sm">
                <Column field="empleado" header="EMPL." sortable body={empleadoTemplate}></Column>
                <Column field="retenciones" header="RETENCIONES" sortable body={data => data.retenciones.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}></Column>
                <Column field="totalReal" header="TOTAL REAL" sortable body={totalRealTemplate}></Column>
            </DataTable>
        </div>
    );
}
