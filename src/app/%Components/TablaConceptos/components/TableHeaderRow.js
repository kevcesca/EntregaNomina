import React from "react";
import PropTypes from "prop-types";
import { TableRow, TableCell, Checkbox } from "@mui/material";
import styles from "../ReusableTable.module.css";

const TableHeaderRow = ({
    columns,
    deletable,
    filteredData = [], // Usamos filteredData
    selectedRows = [], // Aseguramos valores por defecto
    handleSelectAll,
}) => (
    <TableRow>
        <TableCell padding="checkbox" className={styles.tableCell}>
            <Checkbox
                indeterminate={
                    selectedRows.length > 0 && selectedRows.length < filteredData.length
                }
                checked={
                    filteredData.length > 0 &&
                    selectedRows.length === filteredData.length
                }
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
    deletable: PropTypes.bool.isRequired,
    filteredData: PropTypes.array, // Cambiamos data a filteredData
    selectedRows: PropTypes.array,
    handleSelectAll: PropTypes.func.isRequired,
};

export default TableHeaderRow;
