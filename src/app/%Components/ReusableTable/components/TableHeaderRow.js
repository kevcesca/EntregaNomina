import React from "react";
import PropTypes from "prop-types";
import { TableRow, TableCell, Checkbox } from "@mui/material";
import styles from "../ReusableTable.module.css";

const TableHeaderRow = ({ columns, deletable, data, selectedRows, setSelectedRows }) => (
    <TableRow>
        <TableCell padding="checkbox" className={styles.tableCell} >
            <Checkbox
                indeterminate={
                    selectedRows.length > 0 && selectedRows.length < data.length
                }
                checked={data.length > 0 && selectedRows.length === data.length}
                onChange={(event) =>
                    setSelectedRows(event.target.checked ? data.map((row) => row) : [])
                }
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
    data: PropTypes.array.isRequired,
    selectedRows: PropTypes.array.isRequired,
    setSelectedRows: PropTypes.func.isRequired,
};

export default TableHeaderRow;
