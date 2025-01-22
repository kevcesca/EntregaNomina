import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
    Table,
    TableBody,
    TableContainer,
    Paper,
    TablePagination,
    Button
} from "@mui/material";
import styles from "./ReusableTable.module.css";
import Header from "./components/Header";
import TableHeaderRow from "./components/TableHeaderRow";
import TableRowComponent from "./components/TableRowComponent";
import ExportModal from "./components/ExportModal";
import { Toast } from 'primereact/toast';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const ReusableTable = ({
    columns,
    fetchData, // Función para obtener los datos
    editable = false,
    deletable = false,
    insertable = false,
    onEdit, // Se ejecutará al guardar una edición
    onDelete, // Se ejecutará al eliminar
    onInsert, // Se ejecutará al insertar
}) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [editingRow, setEditingRow] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [creatingRow, setCreatingRow] = useState(false);
    const [newRowData, setNewRowData] = useState({});
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const [data, setData] = useState([]); // Estado para los datos de la tabla
    const toast = useRef(null); // Referencia para el Toast
    const [searchQuery, setSearchQuery] = useState("");

    // Obtener los datos al cargar el componente
    useEffect(() => {
        if (fetchData) {
            fetchData()
                .then((response) => setData(response))
                .catch((error) => {
                    console.error("Error al obtener los datos:", error);
                    showErrorToast(error); // Mostrar toast de error
                });
        }
    }, [fetchData]);

    // Iniciar creación de una nueva fila
    const handleCreate = () => {
        if (!Array.isArray(columns) || columns.some((col) => !col || !col.accessor)) {
            console.error("Las columnas no tienen el formato esperado.");
            return;
        }

        const emptyRow = columns.reduce((acc, col) => ({ ...acc, [col.accessor]: "" }), {});
        setCreatingRow(true);
        setNewRowData(emptyRow);
        setEditingRow(emptyRow);
    };

    // Guardar la nueva fila
    const handleSaveNewRow = (newRow) => {
        if (onInsert) {
            onInsert(newRow)
                .then(() => {
                    fetchData().then((response) => {
                        setData(response);
                        setSelectedRows([]); // Limpia la selección al crear un nuevo concepto
                    });
                    setCreatingRow(false);
                    setNewRowData({});
                    setEditingRow(null);
                    toast.current.show({
                        severity: "success",
                        summary: "Éxito",
                        detail: "Elemento creado correctamente",
                        life: 3000,
                    });
                })
                .catch((error) => {
                    console.error("Error al insertar:", error);
                    showErrorToast(error);
                });
        } else {
            console.error("onInsert prop is not defined");
        }
    };

    const handleCancelNewRow = () => {
        setCreatingRow(false);
        setNewRowData({});
        setEditingRow(null);
    };

    // Guardar cambios de edición
    const handleSave = (editedRow) => {
        if (onEdit) {
            onEdit(editedRow)
                .then(() => {
                    fetchData().then((response) => setData(response));
                    setEditingRow(null);
                    setEditedData({});
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Elemento actualizado correctamente', life: 3000 });
                })
                .catch((error) => {
                    console.error("Error al editar:", error);
                    showErrorToast(error);
                });
        } else {
            console.error("onEdit prop is not defined");
        }
    };

    // Cancelar edición
    const handleCancel = () => {
        setEditingRow(null);
        setEditedData({});
    };

    // Función para eliminar filas seleccionadas
    const handleDeleteSelected = () => {
        if (onDelete && selectedRows.length > 0) {
            const deletePromises = selectedRows.map((row) => onDelete(row.id_concepto || row.id)); // Extrae solo el ID

            Promise.all(deletePromises)
                .then((results) => {
                    const allDeleted = results.every((result) => result); // Verifica si todos se eliminaron correctamente
                    if (allDeleted) {
                        toast.current.show({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Elementos eliminados correctamente',
                            life: 3000,
                        });
                    } else {
                        toast.current.show({
                            severity: 'warn',
                            summary: 'Advertencia',
                            detail: 'Algunos elementos no se pudieron eliminar',
                            life: 3000,
                        });
                    }
                    fetchData().then((response) => setData(response)); // Refresca los datos
                    setSelectedRows([]); // Limpia la selección
                })
                .catch((error) => {
                    console.error("Error deleting rows:", error);
                    showErrorToast(error); // Muestra mensaje de error
                });
        } else {
            console.error("onDelete prop is not defined or no rows selected");
        }
    };

    // Manejar la apertura y cierre del modal de exportación
    const handleExportModalOpen = () => {
        if (selectedRows.length === 0) {
            toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: 'Selecciona al menos una fila para exportar.', life: 3000 });
            return;
        }
        setExportModalOpen(true);
    };

    const handleExportModalClose = () => {
        setExportModalOpen(false);
    };

    const handleSelectRow = (row) => {
        const isSelected = selectedRows.some((selected) => selected.id === row.id);
        if (isSelected) {
            // Si ya está seleccionada, la quitamos
            setSelectedRows((prev) => prev.filter((selected) => selected.id !== row.id));
        } else {
            // Si no está seleccionada, la agregamos
            setSelectedRows([row]); // Solo permite seleccionar una fila
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedRows(filteredData); // Selecciona todas las filas
        } else {
            setSelectedRows([]); // Deselecciona todas
        }
    };

    // Filtrar datos según la búsqueda
    const filteredData = data.filter((row) =>
        columns.some((col) =>
            (row[col.accessor] || "")
                .toString()
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        )
    );

    // Función para mostrar el toast de error personalizado
    const showErrorToast = (error) => {
        let mensajeCorto = "Error desconocido";
        let statusCode = null; // Variable para almacenar el código de estado

        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            statusCode = error.response.status;
            mensajeCorto = `Error ${statusCode}: ${error.message}`; // Mensaje con código de estado
        } else if (error.request) {
            // La solicitud fue hecha pero no se recibió respuesta
            mensajeCorto = "Error: No se recibió respuesta del servidor";
        } else {
            // Error en la configuración de la solicitud
            mensajeCorto = error.message;
        }

        toast.current.show({
            severity: 'error',
            summary: 'Error',
            detail: (
                <div>
                    {mensajeCorto}
                    <Button
                        variant="text"
                        color="inherit"
                        size="small"
                        onClick={() => {
                            toast.current.clear();
                            toast.current.show({
                                severity: 'error',
                                summary: 'Detalles del Error',
                                detail: (
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {statusCode && <div>Código de estado: {statusCode}</div>}
                                        {error.message}
                                        {error.response && (
                                            <>
                                                <br />
                                                <pre>{JSON.stringify(error.response, null, 2)}</pre>
                                            </>
                                        )}
                                    </div>
                                ),
                                life: 10000,
                            });
                        }}
                    >
                        Ver más
                    </Button>
                </div>
            ),
            life: 5000,
        });
    };

    return (
        <Paper className={styles.tableContainer}>
            <Toast ref={toast} />
            <Header
                insertable={insertable}
                onInsert={handleCreate}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onExport={handleExportModalOpen}
                disableExport={selectedRows.length === 0}
                onDeleteSelected={handleDeleteSelected}
                disableDeleteSelected={selectedRows.length === 0}
                deletable={deletable} // Pasar la prop deletable al Header
            />
            <TableContainer className={styles.tableContainer}>
                <Table>
                    <TableHeaderRow
                        columns={columns}
                        deletable={deletable}
                        data={data}
                        selectedRows={selectedRows}
                        setSelectedRows={setSelectedRows}
                        handleSelectAll={handleSelectAll}
                    />
                    <TableBody>
                        {creatingRow && (
                            <TableRowComponent
                                row={newRowData}
                                columns={columns}
                                editable={true}
                                isNewRow
                                editingRow={newRowData}
                                setEditingRow={setEditingRow}
                                setEditedData={setNewRowData}
                                onSave={handleSaveNewRow}
                                onCancel={handleCancelNewRow}
                                selectedRows={selectedRows}
                                handleSelectRow={handleSelectRow}
                            />
                        )}
                        {filteredData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => (
                                <TableRowComponent
                                    key={row.id_concepto || row.id}
                                    row={row}
                                    columns={columns}
                                    editable={editable}
                                    deletable={deletable}
                                    editingRow={editingRow}
                                    setEditingRow={setEditingRow}
                                    editedData={editedData}
                                    setEditedData={setEditedData}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                    onDelete={() => handleDeleteRow(row)} // Se agrega la función de eliminación
                                    handleSelectRow={handleSelectRow}
                                    selectedRows={selectedRows}
                                />
                            ))}
                    </TableBody>
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
                onClose={handleExportModalClose}
                selectedRows={selectedRows}
                columns={columns}
            />
        </Paper>
    );
};

ReusableTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            accessor: PropTypes.string.isRequired,
        })
    ).isRequired,
    fetchData: PropTypes.func.isRequired,
    editable: PropTypes.bool,
    deletable: PropTypes.bool,
    insertable: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onInsert: PropTypes.func,
};

export default ReusableTable;