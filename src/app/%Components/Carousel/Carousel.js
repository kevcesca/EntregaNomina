'use client';
import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Paper, Button, Typography, Box, ThemeProvider } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Image from 'next/image';
import styles from './Carousel.module.css';
import theme from '../../$tema/theme';

const responsive = {
    superLargeDesktop: {
        breakpoint: { max: 4000, min: 3000 },
        items: 1
    },
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 1
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 1
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1
    }
};

const items = [
    {
        title: "Genera Reportes de Nómina",
        description: "Pellentesque egestas elementum egestas faucibus sem. Velit nunc egestas ut morbi. Leo diam diam nibh eget fermentum massa pretium. Mi mauris nulla ac dictum ut mauris non.",
        image: "/nomina.jpg"
    },
    {
        title: "Genera Reportes de Nómina",
        description: "Pellentesque egestas elementum egestas faucibus sem. Velit nunc egestas ut morbi. Leo diam diam nibh eget fermentum massa pretium. Mi mauris nulla ac dictum ut mauris non.",
        image: "/nomina.jpg"
    },
    // Otros elementos...
];

const CarouselItem = ({ item }) => (
    <Paper className={styles.carouselItem}>
        <Box className={styles.imageContainer}>
            <Image className={styles.images} src={item.image} alt={item.title} layout="fill" objectFit="cover" />
        </Box>
        <Box className={styles.textContainer}>
            <Typography variant="h5">{item.title}</Typography>
            <Typography variant="body1">{item.description}</Typography>
            <Button className={styles.boton} variant="contained" color="primary" endIcon={<ArrowForwardIcon />}>
                Ver más
            </Button>
        </Box>
    </Paper>
);

const CustomCarousel = () => {
    return (
        <ThemeProvider theme={theme}>
            <div className={styles.carouselContainer}>
                <Carousel responsive={responsive}>
                    {items.map((item, index) => (
                        <CarouselItem key={index} item={item} />
                    ))}
                </Carousel>
            </div>
        </ThemeProvider>
    );
};

export default CustomCarousel;
