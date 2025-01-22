'use client';
import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <p>ALCALDÍA AZCAPOTZALCO</p>
                <p>CASTILLA OTE. S/N CENTRO, AZCAPOTZALCO, 02000 CIUDAD DE MÉXICO, CDMX</p>
            </div>
        </footer>
    );
}
