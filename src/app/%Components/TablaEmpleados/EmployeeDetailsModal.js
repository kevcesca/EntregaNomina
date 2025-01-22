// src/components/EmployeeDetailsModal/EmployeeDetailsModal.js

'use client';

import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import styles from './TablaUsuarios.module.css';

export default function EmployeeDetailsModal({ open, onClose, employeeData }) {
    if (!employeeData) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="employee-details-modal-title"
            aria-describedby="employee-details-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxWidth: 600,
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <Typography id="employee-details-modal-title" variant="h6" gutterBottom>
                    Detalles del Empleado
                </Typography>
                <Box className={styles.employeeDetails}>
                    {Object.entries(employeeData).map(([key, value]) => (
                        <Typography key={key} variant="body1">
                            <strong>{key}:</strong> {value || 'N/A'}
                        </Typography>
                    ))}
                </Box>
                <Box sx={{ marginTop: 3, textAlign: 'center' }}>
                    <Button variant="contained" onClick={onClose}>
                        Cerrar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
