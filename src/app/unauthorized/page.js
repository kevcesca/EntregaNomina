'use client';
import React from 'react';
import Link from 'next/link';
import styles from './page.module.css'

export default function Unauthorized() {
    return (
        <main className={styles.main}>
            <h1>Acceso denegado</h1>
            <p>No tienes permisos para ver esta página</p>
            <p>Contacta a tu administrador de sistema para obtener acceso</p>
            <Link className={styles.tWhite} href="/" passHref>Regresa al menu principal</Link>
        </main>
    );
}
