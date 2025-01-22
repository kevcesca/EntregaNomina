import React from 'react';
import { Box, Grid, TextField, Button, MenuItem, Typography, InputLabel } from '@mui/material';

export default function CLCForm({
  conceptos,
  selectedCLC,
  onConceptoChange,
  onFieldChange,
  formData,
  onFileChange,
  handleAgregarCLC,
}) {
  const { id, fechaOperacion, codigo, montoBruto, comentario, evidenciaNombre } = formData;

  return (
    <Box>
      {/* Campo de Concepto de CLC */}
      <TextField
        sx={{marginTop:"2rem"}}
        select
        label="Concepto de CLC"
        value={selectedCLC} // Aquí se mantiene sincronizado el valor seleccionado
        onChange={(e) => onConceptoChange(e.target.value)} // Actualiza el valor seleccionado
        fullWidth
      >
        {conceptos.map((item, index) => (
          <MenuItem key={index} value={item}>
            {item}
          </MenuItem>
        ))}
      </TextField>

      {/* Otros Campos */}
      <Grid container spacing={2} mt={1}>
        <Grid item xs={6}>
          <TextField label="ID" value={id} InputProps={{ readOnly: true }} fullWidth />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Fecha Operación" value={fechaOperacion} InputProps={{ readOnly: true }} fullWidth />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Código" value={codigo} InputProps={{ readOnly: true }} fullWidth />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Monto Bruto" value={montoBruto} InputProps={{ readOnly: true }} fullWidth />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Comentario"
            value={comentario}
            onChange={(e) => onFieldChange('comentario', e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12}>
          <InputLabel>Subir Evidencia (PDF)</InputLabel>
          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="contained" component="label" color="secondary">
              Seleccionar Archivo
              <input type="file" hidden accept="application/pdf" onChange={onFileChange} />
            </Button>
            <Typography variant="body2">{evidenciaNombre}</Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Botón para agregar CLC */}
      <Button variant="contained" color="primary" onClick={handleAgregarCLC} sx={{ mt: 2 }}>
        Agregar CLC
      </Button>
    </Box>
  );
}
