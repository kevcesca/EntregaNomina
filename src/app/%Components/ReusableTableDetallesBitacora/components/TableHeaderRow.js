import React from "react";
import PropTypes from "prop-types";
import { TableRow, TableCell, Checkbox } from "@mui/material";
import styles from '../ReusableTableDetallesBitacora.module.css'; // Ruta corregida

function TableHeaderRow({ columns, deletable, data = [], selectedRows = [], handleSelectAll }) {
  const totalRows = Array.isArray(data) ? data.length : 0;
  const totalSelected = Array.isArray(selectedRows) ? selectedRows.length : 0;

  return (
    <TableRow>
      {deletable && (
        <TableCell className={styles.tableHead}>
          <Checkbox
            indeterminate={totalSelected > 0 && totalSelected < totalRows}
            checked={totalRows > 0 && totalSelected === totalRows}
            onChange={(event) =>
              handleSelectAll(event.target.checked ? data : [])
            }
          />
        </TableCell>
      )}
      {columns.map((column, index) => (
        <TableCell key={index} className={styles.tableHeader}>
          {column.label}
        </TableCell>
      ))}
    </TableRow>
  );
}

TableHeaderRow.propTypes = {
  columns: PropTypes.array.isRequired,
  deletable: PropTypes.bool,
  data: PropTypes.array,
  selectedRows: PropTypes.array,
  handleSelectAll: PropTypes.func.isRequired,
};

export default TableHeaderRow;
