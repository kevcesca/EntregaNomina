import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Sidebar, Menu, MenuItem, SubMenu, sidebarClasses } from 'react-pro-sidebar';
import styles from './NavBar.module.css';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import ViewListIcon from '@mui/icons-material/ViewList';
import PaymentsTwoToneIcon from '@mui/icons-material/PaymentsTwoTone';
import { useMediaQuery } from '@mui/material';
import KeySharpIcon from '@mui/icons-material/KeySharp';
import ProtectedComponent from '../ProtectedComponent/ProtectedComponent';
import { API_USERS_URL } from '../../%Config/apiConfig';

export default function NavBar() {
    const isSmallScreen = useMediaQuery('(max-width: 600px)');
    const [collapsed, setCollapsed] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // Estado para el modal
    const sidebarRef = useRef(null);
    const [permissions, setPermissions] = useState(null); // Permisos del usuario

    useEffect(() => {
        if (isSmallScreen && !collapsed) {
            setCollapsed(true); // Colapsar solo si la barra no está ya colapsada
        }
    }, [isSmallScreen]); // Actúa únicamente cuando cambia el tamaño de la pantalla

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setCollapsed(true);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Realizar una única solicitud para obtener los permisos del usuario
        const fetchPermissions = async () => {
            try {
                const response = await fetch(`${API_USERS_URL}/verify-permissions`, {
                    credentials: 'include', // Incluye cookies HttpOnly
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                setPermissions(data.permisos); // Guardar permisos en el estado
            } catch (error) {
                console.error('Error al obtener permisos:', error);
                setPermissions([]); // Si hay error, usar permisos vacíos
            }
        };

        fetchPermissions();
    }, []);

    const handleLinkClick = () => {
        setIsLoading(true); // Mostrar el modal al hacer clic en un enlace
        setTimeout(() => setIsLoading(false), 2000); // Ocultar el modal después de 3 segundos
        setCollapsed(true);
    };

    // Mientras se cargan los permisos, muestra un indicador de carga
    if (!permissions) {
        return <div className={styles.loading}>Cargando permisos...</div>;
    }

    return (
        <div className={styles.NavbarContainer} ref={sidebarRef}>
            {/* Modal de Carga */}
            {isLoading && (
                <div className={styles.loadingModal}>
                    <p>Cargando, por favor espere...</p>
                </div>
            )}

            <Sidebar
                collapsed={collapsed}
                transitionDuration={1000}
                rootStyles={{
                    width: '15vw',
                    fontSize: '.9rem',
                    [`.${sidebarClasses.container}`]: {
                        backgroundColor: '#f4f4f47a',
                        border: '2px solid transparent',
                    },
                }}
            >
                <Menu
                    menuItemStyles={{
                        subMenuContent: { width: '18rem' },
                        button: () => ({
                            '&:hover': {
                                backgroundColor: '#9f2241',
                                color: 'white',
                            },
                        }),
                    }}
                >
                    <button className={styles.botonNavbar} onClick={() => setCollapsed(!collapsed)}>
                        <MenuIcon fontSize="large" className={styles.hamburgerIcon} />
                    </button>
                    {collapsed ? (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <SubMenu label="Usuarios" icon={<PeopleIcon />}>
                                <MenuItem icon={<PeopleIcon />} onClick={handleLinkClick} component={<Link href="/GestionUsuarios" className={styles.tWhite} />}>
                                    Usuarios
                                </MenuItem>
                            </SubMenu>
                        </ProtectedComponent>

                    ) : (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <MenuItem icon={<PeopleIcon />} onClick={handleLinkClick} component={<Link href="/GestionUsuarios" className={styles.tWhite} />}>
                                Usuarios
                            </MenuItem>
                        </ProtectedComponent>
                    )}

                    {collapsed ? (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <SubMenu label="Roles" icon={<KeySharpIcon />}>
                                <MenuItem icon={<KeySharpIcon />} className={styles.bgblack} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/Roles" />} >Roles</MenuItem>
                            </SubMenu>
                        </ProtectedComponent>
                    ) : (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <MenuItem icon={<KeySharpIcon />} className={styles.bgblack} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/Roles" />} >Roles</MenuItem>
                        </ProtectedComponent>
                    )}

                    <ProtectedComponent userPermissions={permissions}
                        requiredPermissions={['Acceso_total']}
                    >
                        <SubMenu label="Proceso de Nómina" icon={<SecurityIcon />}>
                            <MenuItem icon={<UploadFileIcon />} className={styles.tWhite} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/CrearNomina" />}>Cargar Nómina</MenuItem>
                            <MenuItem icon={<EditIcon />} className={styles.tWhite} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/Validacion" />}>Cambios de la Nómina</MenuItem>
                            <MenuItem icon={<AssessmentIcon />} className={styles.tWhite} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/CrearNomina/ProcesarDatos" />}>Resumen de la Nómina</MenuItem>
                            <MenuItem icon={<CheckCircleIcon />} className={styles.tWhite} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/AprobarCargaNomina" />}>Aprobar nómina</MenuItem>
                        </SubMenu>
                    </ProtectedComponent>

                    <ProtectedComponent userPermissions={permissions}
                        requiredPermissions={['Acceso_total']}
                    >
                        <SubMenu label="Gestión de Nómina" icon={<SettingsIcon />}>
                            <MenuItem icon={<ListIcon />} className={styles.tWhite} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/Configuracion/Conceptos" />}>Conceptos</MenuItem>
                            <MenuItem icon={<ViewListIcon />} className={styles.tWhite} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/Configuracion/Universos" />}>Universos</MenuItem>
                            <MenuItem icon={<PaymentsTwoToneIcon />} className={styles.tWhite} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/Configuracion/CLC" />}>CLC</MenuItem>
                        </SubMenu>
                    </ProtectedComponent>

                    {collapsed ? (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <SubMenu label="Estados de cuenta" icon={<DescriptionIcon />}>
                                <MenuItem icon={<DescriptionIcon />} className={styles.bgblack} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/CargarEstadosCuenta" />}>Estados de cuenta</MenuItem>
                            </SubMenu>
                        </ProtectedComponent>
                    ) : (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <MenuItem icon={<DescriptionIcon />} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/CargarEstadosCuenta" />}>Estados de cuenta</MenuItem>
                        </ProtectedComponent>
                    )}


                    {collapsed ? (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <SubMenu label="Reportes" icon={<AssessmentIcon />}>
                                <MenuItem icon={<AssessmentIcon />} className={styles.bgblack} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/ListaReportes" />}>Reportes</MenuItem>
                            </SubMenu>
                        </ProtectedComponent>
                    ) : (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <MenuItem icon={<AssessmentIcon />} onClick={handleLinkClick} component={<Link className={styles.tWhite} href="/ListaReportes" />}>Reportes</MenuItem>
                        </ProtectedComponent>
                    )}
                </Menu>
            </Sidebar>
        </div>
    );
}