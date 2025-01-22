'use client';
import React, { useState, useEffect } from 'react';
import "../../globals.css";
import { Grid, useMediaQuery, CircularProgress } from "@mui/material";
import styles from './Wrapper.module.css';

import NavBar from "../NavBar/NavBar";
import AppBar from "../AppBar/AppBar";
import Footer from "../Footer/Footer";

export default function Wrapper({ children, session }) {
    const isSmallScreen = useMediaQuery('(max-width: 600px)');
    const [collapsed, setCollapsed] = useState(isSmallScreen);
    const [loading, setLoading] = useState(true);  // Estado para controlar la carga

    // Simulación de carga
    useEffect(() => {
        // Simular una carga de contenido, puedes reemplazarlo con lógica real
        setTimeout(() => {
            setLoading(false);
        }, 2000); // 2 segundos de simulación de carga
    }, []);

    return (
        <div className={`${styles.wrapperContainer} ${collapsed ? styles.collapsed : ''}`}>
            <Grid container spacing={0} style={{ flex: 1 }}>
                {/* Sidebar */}
                <Grid
                    item
                    xs={collapsed ? 1 : 'auto'}
                    className={styles.sidebarFixed} /* Aquí se aplica la clase sidebarFixed */
                >
                    <NavBar collapsed={collapsed} setCollapsed={setCollapsed} />
                </Grid>

                {/* Contenido main */}
                <Grid
                    item
                    xs
                    style={{ display: 'flex', flexDirection: 'column', marginLeft: collapsed ? 0 : '10px', flex: 1, marginLeft: '5rem' }}
                >
                    <AppBar className={styles.AppBar} />
                    <div className={styles.content}>
                        {loading ? (
                            <div className={styles.loaderContainer}>
                                <CircularProgress />
                            </div>
                        ) : (
                            React.Children.map(children, child =>
                                React.cloneElement(child, { session })
                            )
                        )}
                    </div>
                </Grid>
            </Grid>
            <Footer className={styles.footer} />
        </div>
    );
}
