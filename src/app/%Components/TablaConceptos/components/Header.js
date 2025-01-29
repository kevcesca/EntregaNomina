import React from "react";
import PropTypes from "prop-types";
import { Button, TextField } from "@mui/material";
import styles from "../ReusableTable.module.css";

const Header = ({
    insertable,
    onInsert,
    searchQuery,
    setSearchQuery,
    onExport,
    disableExport,
    onDeleteSelected,
    disableDeleteSelected,
    deletable, // Nueva prop para controlar si se debe mostrar el botón de eliminar
}) => (
    <div className={styles.header}>
        {insertable && (
            <Button
                sx={{ marginRight: '2rem' }}
                color="success"
                variant="contained"
                onClick={onInsert}
            >
                Crear
            </Button>
        )}
        <TextField
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            className={styles.searchBar}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
            color="primary"
            variant="contained"
            onClick={onExport}
            disabled={disableExport}
            sx={{ marginLeft: '2rem' }}
        >
            Exportar
        </Button>
        {/* Mostrar botón de eliminar solo si deletable es true */}
        {deletable && (
            <Button
                color="error"
                variant="contained"
                onClick={onDeleteSelected}
                disabled={disableDeleteSelected}
                sx={{ marginLeft: '1rem' }}
            >
                Eliminar seleccionados
            </Button>
        )}
    </div>
);

Header.propTypes = {
    insertable: PropTypes.bool.isRequired,
    onInsert: PropTypes.func,
    searchQuery: PropTypes.string.isRequired,
    setSearchQuery: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired,
    disableExport: PropTypes.bool.isRequired,
    onDeleteSelected: PropTypes.func.isRequired,
    disableDeleteSelected: PropTypes.bool.isRequired,
    deletable: PropTypes.bool, // Nueva prop para indicar si el botón debe mostrarse
};

export default Header;
