// src/%Components/TablaSeccion/TablaSeccion.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { ProgressBar } from 'primereact/progressbar';
import HeaderSeccion from '../HeaderSeccion/HeaderSeccion'; // Importamos HeaderSeccion
import styles from './TablaSeccion.module.css';

export default function TablaSeccion({ titulo, isOpen, onToggle, progress, tabla }) {
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
