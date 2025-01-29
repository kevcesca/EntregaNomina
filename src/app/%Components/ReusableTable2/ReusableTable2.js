'use client';
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Table,
    TableBody,
    TableContainer,
    Paper,
    TablePagination,
} from '@mui/material';
import styles from './ReusableTable2.module.css';
import Header from './components/Header';
import TableHeaderRow from './components/TableHeaderRow';
import TableRowComponent from './components/TableRowComponent';
import ExportModal from './components/ExportModal';
import { Toast } from 'primereact/toast';

const ReusableTable2 = ({
    columns,
    fetchData,
    editable = false,
    deletable = false,
    insertable = false,
    onEdit,
    onDelete,
    onInsert,
}) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [editingRow, setEditingRow] = useState(null);
    const [creatingRow, setCreatingRow] = useState(false);
    const [newRowData, setNewRowData] = useState({});
    const [data, setData] = useState([]);
    const toast = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isExportModalOpen, setExportModalOpen] = useState(false); // Control del modal de exportación
    const nominaOptions = ['BASE', 'ESTRUCTURA', 'NOMINA 8', 'HONORARIOS'];
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [universoAEliminar, setUniversoAEliminar] = useState(null); // Guarda el universo a eliminar


    useEffect(() => {
        fetchData().then(setData).catch(console.error);
    }, [fetchData]);

    const handleCreate = () => {
        const emptyRow = columns.reduce((acc, col) => ({ ...acc, [col.accessor]: '' }), {});
        setCreatingRow(true);
        setNewRowData(emptyRow);
        setEditingRow(emptyRow);
    };

    const handleSaveNewRow = async (newRow) => {
        try {
            await onInsert(newRow);
            const updatedData = await fetchData();
            setData(updatedData);
            setCreatingRow(false);
           // toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Universo creado correctamente' });
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' });
        }
    };

    const handleSaveEdit = async (editedRow) => {
        try {
            await onEdit(editedRow);
            const updatedData = await fetchData();
            setData(updatedData);
            setEditingRow(null);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Actualizado correctamente' });
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' });
        }
    };

    const handleDeleteSelected = async () => {
        try {
            await Promise.all(selectedRows.map((id) => onDelete(id)));
            const updatedData = await fetchData();
            setData(updatedData);
            setSelectedRows([]);
            // toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Eliminado correctamente' });
        } catch (error) {
            console.error(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
        }
    };
    

    const handleSelectRow = (row) => {
        const id = row.id_universo || row.id;
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            // Selecciona todas las filas visibles (filtradas)
            const allVisibleIds = filteredData.map((row) => row.id_universo || row.id);
            setSelectedRows(allVisibleIds);
        } else {
            setSelectedRows([]);
        }
    };

    const handleExport = () => {
        if (selectedRows.length === 0) {
            toast.current.show({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Selecciona al menos una fila para exportar.',
            });
            return;
        }
        setExportModalOpen(true);
    };

    const filteredData = data.filter((row) =>
        columns.some((col) =>
            (row[col.accessor] || '').toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <Paper className={styles.tableContainer}>
            <Toast ref={toast} />
            <Header
                insertable={insertable}
                onInsert={handleCreate}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onExport={() => setExportModalOpen(true)} // Abrir modal de exportación
                disableExport={selectedRows.length === 0}
                onDeleteSelected={handleDeleteSelected}
                disableDeleteSelected={selectedRows.length === 0}
            />
            <TableContainer>
                <Table>
  <thead>
    <TableHeaderRow
      columns={columns}
      deletable={deletable}
      data={data}
      filteredData={filteredData}
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
      handleSelectAll={handleSelectAll}
    />
  </thead>
  <tbody>
    {creatingRow && (
      <TableRowComponent
        row={newRowData}
        columns={columns}
        editable
        isNewRow
        nominaOptions={nominaOptions}
        onSave={handleSaveNewRow}
        onCancel={() => setCreatingRow(false)}
        selectedRows={selectedRows}
        handleSelectRow={handleSelectRow}
      />
    )}
    {filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
      <TableRowComponent
        key={row.id_universo || row.id}
        row={row}
        columns={columns}
        editable={editable}
        nominaOptions={nominaOptions}
        onSave={handleSaveEdit}
        onCancel={() => setEditingRow(null)}
        selectedRows={selectedRows}
        handleSelectRow={handleSelectRow}
        onDoubleClick={() => setEditingRow(row)}
      />
    ))}
  </tbody>
</Table>

            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />
            <ExportModal
                open={isExportModalOpen}
                onClose={() => setExportModalOpen(false)}
                selectedRows={data.filter((row) => selectedRows.includes(row.id_universo || row.id))}
                columns={columns}
            />
        </Paper>
    );
};

ReusableTable2.propTypes = {
    columns: PropTypes.array.isRequired,
    fetchData: PropTypes.func.isRequired,
    editable: PropTypes.bool,
    deletable: PropTypes.bool,
    insertable: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onInsert: PropTypes.func,
};

export default ReusableTable2;
