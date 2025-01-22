import React from "react";
import PropTypes from "prop-types";
import { Button, TextField } from "@mui/material";
import styles from "../ReusableTable2.module.css";

const Header = ({
    insertable,
    onInsert,
    searchQuery,
    setSearchQuery,
    onExport,
    disableExport,
    onDeleteSelected, // Nueva prop
    disableDeleteSelected, // Nueva prop
}) => (
    <div className={styles.header}>
        {insertable && (
            <Button sx={{ marginRight: '2rem' }} color="success" variant="contained" onClick={onInsert}>
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
        <Button
            color="error"
            variant="contained"
            onClick={onDeleteSelected} // Llama a la función de eliminar seleccionados
            disabled={disableDeleteSelected} // Deshabilitado si no hay filas seleccionadas
            sx={{ marginLeft: '1rem' }}
        >
            Eliminar seleccionados
        </Button>
    </div>
);

Header.propTypes = {
    insertable: PropTypes.bool.isRequired,
    onInsert: PropTypes.func,
    searchQuery: PropTypes.string.isRequired,
    setSearchQuery: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired,
    disableExport: PropTypes.bool.isRequired,
    onDeleteSelected: PropTypes.func.isRequired, // Nueva prop
    disableDeleteSelected: PropTypes.bool.isRequired, // Nueva prop
};

export default Header;
