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
    // const [filteredData, setFilteredData] = useState({});
    const toast = useRef(null); // Referencia para el Toast
    const [searchQuery, setSearchQuery] = useState("");
    // const columns = props.columns || [];


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

    // {filteredData.map((row) =>
    //     row ? (
    //         <TableRowComponent
    //             key={row.id || row.id_concepto}
    //             row={row}
    //             columns={columns}
    //             editable={editable}
    //             handleSelectRow={handleSelectRow}
    //             selectedRows={selectedRows}
    //         />
    //     ) : null
    // )}
    

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
        // Elimina las filas seleccionadas por su ID
        const deletePromises = selectedRows.map((id) => 
            onDelete(id) // Cambia a usar solo IDs
        );

        Promise.all(deletePromises)
            // .then(() => {
            //     toast.current.show({
            //         severity: "success",
            //         summary: "Éxito",
            //         detail: "Filas eliminadas correctamente.",
            //         life: 3000,
            //     });

            //     // Refresca los datos después de eliminar
            //     fetchData().then((response) => setData(response));
            //     setSelectedRows([]); // Limpia la selección
            // })
            .catch((error) => {
                console.error("Error al eliminar:", error);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "No se pudieron eliminar algunas filas.",
                    life: 3000,
                });
            });
    } else {
        toast.current.show({
            severity: "warn",
            summary: "Advertencia",
            detail: "No hay filas seleccionadas para eliminar.",
            life: 3000,
        });
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
        const rowId = row?.id || row?.id_concepto; // Obtén el identificador
        if (!rowId) return; // Si no tiene ID, no hacemos nada
    
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(rowId)
                ? prevSelectedRows.filter((id) => id !== rowId) // Deseleccionar
                : [...prevSelectedRows, rowId] // Seleccionar
        );
    };
    
    
    
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const validRowIds = filteredData
                .filter((row) => row && (row.id || row.id_concepto)) // Filtra filas válidas
                .map((row) => row.id || row.id_concepto); // Extrae IDs válidos
    
            setSelectedRows(validRowIds);
        } else {
            setSelectedRows([]); // Deselecciona todo
        }
    };
    
    
    const filteredData = Array.isArray(data)
    ? data.filter((row) =>
          columns.some((col) =>
              ((row && row[col.accessor]) || "")
                  .toString()
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
          )
      )
    : []; // Valor predeterminado si data no está definido

    
    const selectedData = filteredData.filter((row) =>
        selectedRows.includes(row.id || row.id_concepto) // Verifica IDs válidos
    );

    // Función para mostrar el toast de error personalizado
    const showErrorToast = (error) => {
        let mensajeCorto = "Error desconocido";
        let statusCode = null;
    
        if (error.response) {
            statusCode = error.response.status;
            mensajeCorto = `Error ${statusCode}: ${error.message}`;
    
            // 🛑 Si el error es de clave duplicada, mostrar mensaje genérico
            if (
                error.response.data?.message?.includes("llave duplicada") ||
                error.response.data?.message?.includes("duplicate key")
            ) {
                mensajeCorto = "Este registro ya existe. Intenta con otro valor.";
            }
        } else if (error.message.includes("llave duplicada") || error.message.includes("duplicate key")) {
            mensajeCorto = "Este registro ya existe. Intenta con otro valor.";
        } else if (error.request) {
            mensajeCorto = "Error: No se recibió respuesta del servidor.";
        } else {
            mensajeCorto = error.message;
        }
    
        // ✅ Mostrar solo el mensaje filtrado en el toast
        setTimeout(() => {
            if (toast.current) {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: mensajeCorto,
                    life: 5000,
                });
            }
        }, 200);
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
                        data={data} // Puedes mantener el dataset completo si lo necesitas
                        filteredData={filteredData} // Pasamos las filas visibles                        selectedRows={selectedRows}
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
                selectedRows={selectedData}
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