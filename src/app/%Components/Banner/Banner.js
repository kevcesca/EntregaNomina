'use client';
import React from 'react';
import { Paper, Button, Typography, Box, ThemeProvider } from '@mui/material';
import Image from 'next/image';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from './Banner.module.css';
import theme from '../../$tema/theme'; // Asegúrate de tener la ruta correcta a tu archivo de tema
import Link from 'next/link';

const Banner = () => {
    return (
        <ThemeProvider theme={theme}>
            <Paper className={styles.bannerContainer}>
                <Box className={styles.textContainer}>
                    <Typography variant="h3" className={styles.title}>
                        Procesos de Gestión de Nómina en Azcapotzalco
                    </Typography>
                    <Link className={styles.tWhite} href="/CrearNomina" passHref>
                        <Button variant="contained" color="primary" endIcon={<ArrowForwardIcon />} className={styles.button}>
                            Más Información
                        </Button>
                    </Link>
                </Box>
                <Box className={styles.imageContainer}>
                    <Image src="homebaner.jpg" alt="Banner Image" layout="fill" objectFit="cover" />
                </Box>
            </Paper>
        </ThemeProvider>
    );
};

export default Banner;
