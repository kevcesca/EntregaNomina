import React, { useState } from 'react';
import { Checkbox, FormControlLabel, FormGroup, Button, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import styles from './ColumnSelector.module.css';

const ColumnSelector = ({ availableColumns, onSelectionChange }) => {
    const theme = useTheme();

    // Inicializamos las selecciones con las columnas y un estado adicional para "Seleccionar todos"
    const initialSelection = availableColumns.reduce((acc, column) => {
        acc[column.key] = column.defaultSelected || false;
        return acc;
    }, {});

    // Agregamos un estado para "select all" que por defecto es false
    const [selectedColumns, setSelectedColumns] = useState(initialSelection);
    const [selectAll, setSelectAll] = useState(false);

    const handleSelectAllChange = (event) => {
        const checked = event.target.checked;
        setSelectAll(checked);
        
        // Cambiar el estado de todos los checkboxes a lo que seleccione "select all"
        const newSelection = availableColumns.reduce((acc, column) => {
            acc[column.key] = checked;
            return acc;
        }, {});
        setSelectedColumns(newSelection);
    };

    const handleCheckboxChange = (event) => {
        setSelectedColumns({
            ...selectedColumns,
            [event.target.name]: event.target.checked,
        });
    };

    const handleSubmit = () => {
        onSelectionChange(selectedColumns);
    };

    return (
        <Box 
            sx={{ 
                marginBottom: 2, 
                padding: 2, 
                border: `1px solid ${theme.palette.primary.main}`, 
                borderRadius: '4px',
                backgroundColor: theme.palette.background.paper,
            }} 
            className={styles.container}
        >
            <Typography variant="h6" color="primary">
                Campos para generar tabla
            </Typography>

            {/* Casilla "Seleccionar todos" */}
            <FormGroup sx={{ marginBottom: '1rem' }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={selectAll}
                            onChange={handleSelectAllChange}
                            sx={{
                                color: theme.palette.primary.main,
                                '&.Mui-checked': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        />
                    }
                    label="Seleccionar todos"
                />
            </FormGroup>

            {/* Resto de las casillas de columna */}
            <FormGroup 
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)', // 4 columnas de igual ancho
                    gap: '1rem', // Espacio entre cada checkbox
                    color: theme.palette.text.primary
                }}
            >
                {availableColumns.map((column) => (
                    <FormControlLabel
                        key={column.key}
                        control={
                            <Checkbox
                                checked={selectedColumns[column.key]}
                                onChange={handleCheckboxChange}
                                name={column.key}
                                sx={{
                                    color: theme.palette.primary.main,
                                    '&.Mui-checked': {
                                        color: theme.palette.primary.main,
                                    },
                                }}
                            />
                        }
                        label={column.label}
                    />
                ))}
            </FormGroup>

            <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                    marginTop: '1rem',
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                    },
                }}
            >
                Generar tabla
            </Button>
        </Box>
    );
};

export default ColumnSelector;
