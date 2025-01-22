import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            light: '#b9274b',
            main: '#9f2241',
            dark: '#711c31',
            contrastText: '#fff',
        },
        secondary: {
            light: '#e2b673',
            main: '#bc955c',
            dark: '#987849',
            contrastText: '#fff',
        },
        success: { // Configuración para el color de éxito
            light: '#4b8372',
            main: '#235b4e',
            dark: '#123630',
            contrastText: '#fff',
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
            },
        },
    },
});

export default theme;
