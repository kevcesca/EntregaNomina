import React from "react";
import PropTypes from "prop-types";
import { TableRow, TableCell, Checkbox } from "@mui/material";
import styles from "../ReusableTable2.module.css";

const TableHeaderRow = ({ columns, filteredData, selectedRows, setSelectedRows, handleSelectAll }) => (
  <TableRow>
    <TableCell padding="checkbox" className={styles.tableCell}>
      <Checkbox
        indeterminate={
          selectedRows.length > 0 && selectedRows.length < filteredData.length
        }
        checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
        onChange={handleSelectAll}
      />
    </TableCell>
    {columns.map((col, index) => (
      <TableCell key={index} className={`${styles.tableCell} ${styles.tableHeader}`}>
        {col.label || col}
      </TableCell>
    ))}
  </TableRow>
);

TableHeaderRow.propTypes = {
  columns: PropTypes.array.isRequired,
  filteredData: PropTypes.array.isRequired, // Prop agregada
  selectedRows: PropTypes.array.isRequired,
  setSelectedRows: PropTypes.func.isRequired,
  handleSelectAll: PropTypes.func.isRequired,
};

export default TableHeaderRow;
