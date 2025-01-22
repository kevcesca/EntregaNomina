// src/%Components/HeaderSeccion/HeaderSeccion.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import styles from './HeaderSeccion.module.css';

export default function HeaderSeccion({ titulo, isOpen, onToggle }) {
    return (
        <Box
            display="flex"
            alignItems="center"
            sx={{ margin: '1rem', cursor: 'pointer' }}
            onClick={onToggle}
        >
            <Typography variant="h5" className={styles.h2}>
                {titulo}
            </Typography>
            <Button className={styles.buttonPlus} variant="primary">
                {isOpen ? '-' : '+'}
            </Button>
        </Box>
    );
}
