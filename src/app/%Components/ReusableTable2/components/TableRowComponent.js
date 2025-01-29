import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  TableRow,
  TableCell,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

const TableRowComponent = ({
  row,
  columns,
  editable,
  onSave,
  onCancel,
  isNewRow,
  nominaOptions,
  handleSelectRow,
  selectedRows,
  onDoubleClick,
}) => {
  const [isEditing, setIsEditing] = useState(isNewRow);
  const [editedRow, setEditedRow] = useState(row);

  useEffect(() => {
    setEditedRow(row);
  }, [row]);

  const handleSaveClick = () => {
    onSave(editedRow);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    onCancel();
    setIsEditing(false);
  };

  const handleInputChange = (colAccessor, value) => {
    setEditedRow((prev) => ({ ...prev, [colAccessor]: value }));
  };

  return (
    <TableRow onDoubleClick={() => onDoubleClick && setIsEditing(true)}>
      {/* Checkbox para selección de fila */}
      <TableCell padding="checkbox">
        <Checkbox
          checked={selectedRows.includes(row.id_universo || row.id)}
          onChange={() => handleSelectRow(row)}
        />
      </TableCell>
      {/* Renderizado de columnas */}
      {columns.map((col, index) => (
  <TableCell key={col.accessor}>
    {isEditing && (isNewRow || index === 1) ? ( // 🔴 Solo permite editar la SEGUNDA columna (index === 1)
      col.accessor === "nombre_nomina" ? ( 
        <Select
          value={editedRow[col.accessor] || ""}
          onChange={(e) => handleInputChange(col.accessor, e.target.value)}
          fullWidth
        >
          {nominaOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <TextField
          value={editedRow[col.accessor] || ""}
          onChange={(e) => handleInputChange(col.accessor, e.target.value)}
          fullWidth
          variant="standard"
        />
      )
    ) : (
      row[col.accessor] // 🔴 Para la primera columna (index === 0), se muestra solo el valor sin edición
    )}
  </TableCell>
))}

      {/* Botones de Aceptar y Cancelar */}
      {isEditing && (
        <TableCell>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
            <Button
                variant="contained"
                sx={{
                    backgroundColor: "#9b1d1d",
                    color: "white",
                    "&:hover": { backgroundColor: "#7b1616" },
                }}
                onClick={handleSaveClick}
            >
                Aceptar
            </Button>
            <Button
                variant="contained"
                sx={{
                    backgroundColor: "#9b1d1d",
                    color: "white",
                    "&:hover": { backgroundColor: "#7b1616" },
                }}
                onClick={handleCancelClick}
            >
                Cancelar
            </Button>
        </div>
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
  nominaOptions: PropTypes.array.isRequired,
  onDoubleClick: PropTypes.func,
};

export default TableRowComponent;
