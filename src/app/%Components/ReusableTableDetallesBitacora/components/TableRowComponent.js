import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  TableRow,
  TableCell,
  Checkbox,
  TextField,
  IconButton,
} from "@mui/material";
import { Save, Close } from "@mui/icons-material";
import styles from "../ReusableTableDetallesBitacora.module.css";

const TableRowComponent = ({
  row,
  columns = [], // Aseguramos que siempre sea un array
  handleSelectRow,
  selectedRows = [], // Aseguramos que siempre sea un array
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRow, setEditedRow] = useState(row || {});

  const handleInputChange = (colAccessor, value) => {
    setEditedRow((prev) => ({ ...prev, [colAccessor]: value }));
  };

  return (
    <TableRow>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selectedRows.includes(row.id)}
          onChange={() => handleSelectRow(row)}
        />
      </TableCell>
      {columns.map((col) => (
        <TableCell key={col.accessor} className={styles.tableCell}>
          {isEditing ? (
            <TextField
              value={editedRow[col.accessor] || ""}
              onChange={(e) => handleInputChange(col.accessor, e.target.value)}
              fullWidth
              variant="standard"
            />
          ) : (
            row[col.accessor] || "-" // Mostramos el valor de la columna en la fila
          )}
        </TableCell>
      ))}
      {isEditing && (
        <TableCell className={styles.actionButtons}>
          <IconButton color="success">
            <Save />
          </IconButton>
          <IconButton color="error">
            <Close />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
};

TableRowComponent.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      accessor: PropTypes.string.isRequired,
    })
  ).isRequired,
  handleSelectRow: PropTypes.func.isRequired,
  selectedRows: PropTypes.array.isRequired,
};

export default TableRowComponent;
