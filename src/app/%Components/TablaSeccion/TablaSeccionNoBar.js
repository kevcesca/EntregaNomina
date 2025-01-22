// src/%Components/TablaSeccion/TablaSeccion.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import HeaderSeccion from '../HeaderSeccion/HeaderSeccion'; // Importamos HeaderSeccion
import styles from './TablaSeccion.module.css';

export default function TablaSeccionNoBar({ titulo, isOpen, onToggle, progress, tabla }) {
    return (
        <Box>
            <HeaderSeccion titulo={titulo} isOpen={isOpen} onToggle={onToggle} />
            {isOpen && (
                <>
                    {tabla}
                </>
            )}
        </Box>
    );
}
