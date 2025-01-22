// components/ReporteForm.js
import React, { useState } from 'react';
import { Container, FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid } from '@mui/material';

const ReporteForm = ({ reportes }) => {
    const [selectedReporte, setSelectedReporte] = useState('');
    const [formData, setFormData] = useState({});

    const handleReporteChange = (event) => {
        setSelectedReporte(event.target.value);
        // Reset form data when report type changes
        setFormData({});
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Process the form data to generate the report
        console.log('Form data submitted:', formData);
    };

    return (
        <Container>
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="reporte-select-label">Tipo de Reporte</InputLabel>
                    <Select
                        labelId="reporte-select-label"
                        id="reporte-select"
                        value={selectedReporte}
                        onChange={handleReporteChange}
                    >
                        {reportes.map((reporte) => (
                            <MenuItem key={reporte.id} value={reporte.id}>
                                {reporte.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {selectedReporte && (
                    <Grid container spacing={2}>
                        {/* Render dynamic fields based on the selected report */}
                        {reportes
                            .find((reporte) => reporte.id === selectedReporte)
                            .fields.map((field) => (
                                <Grid item xs={12} sm={6} key={field.name}>
                                    <TextField
                                        fullWidth
                                        label={field.label}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                            ))}
                    </Grid>
                )}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Generar Reporte
                </Button>
            </form>
        </Container>
    );
};

export default ReporteForm;
