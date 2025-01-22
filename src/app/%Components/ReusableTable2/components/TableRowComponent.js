import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TableRow, TableCell, Checkbox, TextField, Select, MenuItem, IconButton } from "@mui/material";
import { Save, Close } from "@mui/icons-material";

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
      <TableCell padding="checkbox">
        <Checkbox
          checked={selectedRows.includes(row.id_universo || row.id)}
          onChange={() => handleSelectRow(row)}
        />
      </TableCell>
      {columns.map((col) => (
        <TableCell key={col.accessor}>
          {isEditing && col.accessor === "nombre_nomina" ? (
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
          ) : isEditing ? (
            <TextField
              value={editedRow[col.accessor] || ""}
              onChange={(e) => handleInputChange(col.accessor, e.target.value)}
              fullWidth
              variant="standard"
            />
          ) : (
            row[col.accessor]
          )}
        </TableCell>
      ))}
      {isEditing && (
        <TableCell>
          <IconButton onClick={handleSaveClick} color="success">
            <Save />
          </IconButton>
          <IconButton onClick={handleCancelClick} color="error">
            <Close />
          </IconButton>
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
