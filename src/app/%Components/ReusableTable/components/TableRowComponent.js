import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TableRow, TableCell, Checkbox, TextField, IconButton, Button } from "@mui/material";
import { Save, Close } from "@mui/icons-material";

const TableRowComponent = ({
    row,
    columns,
    editable,
    onSave,
    onCancel,
    isNewRow,
    handleSelectRow,
    selectedRows,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedRow, setEditedRow] = useState(row);

    useEffect(() => {
        setEditedRow(row);
    }, [row, isNewRow]);

    const handleDoubleClick = () => {
        if (editable && !isNewRow) {
            setIsEditing(true);
        }
    };

    const handleInputChange = (colAccessor, value) => {
        if (colAccessor === "id_concepto") {
            // Solo permitir números en id_concepto
            if (!/^\d*$/.test(value)) return;
        }

        setEditedRow((prevRow) => ({
            ...prevRow,
            [colAccessor]: colAccessor === "nombre_concepto" ? value.toUpperCase() : value, // Convertir a mayúsculas
        }));
    };


    const handleSaveClick = () => {
        onSave(editedRow);
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        onCancel();
        setIsEditing(false);
        setEditedRow(row); // Restaurar valores originales
    };

    return (
        <TableRow onDoubleClick={handleDoubleClick} style={{ cursor: editable ? "pointer" : "default" }}>
            <TableCell padding="checkbox">
                {!isNewRow && (
                 <Checkbox
                 checked={selectedRows.includes(row.id || row.id_concepto)} // Verifica el ID
                 onChange={() => handleSelectRow(row)}
             />
             
             
             
               

                )}
            </TableCell>
            {columns.map((col) => (
                <TableCell key={col.accessor}>
                    {isEditing || isNewRow ? (
                        // Evaluamos si la columna es "id_concepto" y si no es nueva (isNewRow)
                        (col.accessor === "id_concepto" && !isNewRow) ? (
                            <span>{row[col.accessor]}</span> // Mostramos el ID como texto simple
                        ) : (
                            <TextField
                                value={editedRow[col.accessor] || ""}
                                onChange={(e) => handleInputChange(col.accessor, e.target.value)}
                                size="small"
                                variant="standard"
                                InputProps={{
                                    disableUnderline: !isEditing && !isNewRow,
                                }}
                            />
                        )
                    ) : (
                        // Mostrar como texto si no está en edición o creación
                        <span>{row[col.accessor]}</span>
                    )}
                </TableCell>
            ))}
            {(isEditing || isNewRow) && (
                <TableCell>
                    <Button color="primary" variant="contained" style={{}} onClick={handleSaveClick}>
                        Aceptar
                    </Button>
                    <Button color="primary" variant="contained" style={{ margin: "10px" }} onClick={handleCancelClick}>
                        Cancelar
                    </Button>
                </TableCell>
            )}
        </TableRow>
    );
};

TableRowComponent.propTypes = {
    row: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    editable: PropTypes.bool,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isNewRow: PropTypes.bool,
    handleSelectRow: PropTypes.func,
    selectedRows: PropTypes.array,
};

export default TableRowComponent;
