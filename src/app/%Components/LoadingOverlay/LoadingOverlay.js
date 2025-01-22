'use client';
import React from 'react';
import PropTypes from 'prop-types';
import Image from 'next/image';
import styles from './LoadingOverlay.module.css';

export default function LoadingOverlay({ isLoading, children }) {
    return (
        <>
            {isLoading && (
                <div className={styles.loadingContainer}>
                    <Image
                        src="/carga.svg"
                        alt="Barra de carga"
                        width={150}
                        height={150}
                        className={styles.image}
                    />
                </div>
            )}
            {children}
        </>
    );
}

LoadingOverlay.propTypes = {
    isLoading: PropTypes.bool.isRequired,
    children: PropTypes.node,
};
