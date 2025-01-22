import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Sidebar, Menu, MenuItem, SubMenu, sidebarClasses } from 'react-pro-sidebar';
import styles from './NavBar.module.css';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloudIcon from '@mui/icons-material/Cloud';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoneyIcon from '@mui/icons-material/Money';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import ViewListIcon from '@mui/icons-material/ViewList';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import PaymentsTwoToneIcon from '@mui/icons-material/PaymentsTwoTone';
import CreditCardOffIcon from '@mui/icons-material/CreditCardOff';
import { useMediaQuery } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import KeySharpIcon from '@mui/icons-material/KeySharp';
import CancelPresentationSharpIcon from '@mui/icons-material/CancelPresentationSharp';
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
                                <Link className={styles.tWhite} href="/GestionUsuarios" passHref>
                                    <MenuItem icon={<PeopleIcon />} className={styles.bgblack} onClick={handleLinkClick}>
                                        Usuarios
                                    </MenuItem>
                                </Link>
                            </SubMenu>
                        </ProtectedComponent>

                    ) : (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <Link className={styles.textAlone} href="/GestionUsuarios" passHref>
                                <MenuItem icon={<PeopleIcon />} onClick={handleLinkClick}>
                                    Usuarios
                                </MenuItem>
                            </Link>
                        </ProtectedComponent>
                    )}

                    {collapsed ? (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <SubMenu label="Roles" icon={<KeySharpIcon />}>
                                <Link className={styles.tWhite} href="/Roles" passHref>
                                    <MenuItem icon={<KeySharpIcon />} className={styles.bgblack} onClick={handleLinkClick}>Roles</MenuItem>
                                </Link>
                            </SubMenu>
                        </ProtectedComponent>
                    ) : (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <Link className={styles.textAlone} href="/Roles" passHref>
                                <MenuItem icon={<KeySharpIcon />} onClick={handleLinkClick}>Roles</MenuItem>
                            </Link>
                        </ProtectedComponent>
                    )}

                    <ProtectedComponent userPermissions={permissions}
                        requiredPermissions={['Acceso_total']}
                    >
                        <SubMenu label="Proceso de Nómina" icon={<SecurityIcon />}>
                            <Link className={styles.tWhite} href="/CrearNomina" passHref>
                                <MenuItem icon={<UploadFileIcon />} className={styles.bgblack} onClick={handleLinkClick}>Cargar Nómina</MenuItem>
                            </Link>
                            <Link className={styles.tWhite} href="/Validacion" passHref>
                                <MenuItem icon={<EditIcon />} className={styles.bgblack} onClick={handleLinkClick}>Cambios de la Nómina</MenuItem>
                            </Link>
                            <Link className={styles.tWhite} href="/CrearNomina/ProcesarDatos" passHref>
                                <MenuItem icon={<AssessmentIcon />} className={styles.bgblack} onClick={handleLinkClick}>Resumen de la Nómina</MenuItem>
                            </Link>
                            <Link className={styles.tWhite} href="/AprobarCargaNomina" passHref>
                                <MenuItem icon={<CheckCircleIcon />} className={styles.bgblack} onClick={handleLinkClick}>Aprobar nómina</MenuItem>
                            </Link>
                        </SubMenu>
                    </ProtectedComponent>

                    <ProtectedComponent userPermissions={permissions}
                        requiredPermissions={['Acceso_total']}
                    >
                        <SubMenu label="Gestión de Nómina" icon={<SettingsIcon />}>
                            <Link className={styles.tWhite} href="/Configuracion/Conceptos" passHref>
                                <MenuItem icon={<ListIcon />} className={styles.bgblack} onClick={handleLinkClick}>Conceptos</MenuItem>
                            </Link>
                            <Link className={styles.tWhite} href="/Configuracion/Universos" passHref>
                                <MenuItem icon={<ViewListIcon />} className={styles.bgblack} onClick={handleLinkClick}>Universos</MenuItem>
                            </Link>
                            <Link className={styles.tWhite} href="/Configuracion/CLC" passHref>
                                <MenuItem icon={<PaymentsTwoToneIcon />} className={styles.bgblack} onClick={handleLinkClick}>CLC</MenuItem>
                            </Link>
                        </SubMenu>
                    </ProtectedComponent>

                    {collapsed ? (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <SubMenu label="Estados de cuenta" icon={<DescriptionIcon />}>
                                <Link className={styles.tWhite} href="/CargarEstadosCuenta" passHref>
                                    <MenuItem icon={<DescriptionIcon />} className={styles.bgblack} onClick={handleLinkClick}>Estados de cuenta</MenuItem>
                                </Link>
                            </SubMenu>
                        </ProtectedComponent>
                    ) : (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <Link className={styles.textAlone} href="/CargarEstadosCuenta" passHref>
                                <MenuItem icon={<DescriptionIcon />} onClick={handleLinkClick}>Estados de cuenta</MenuItem>
                            </Link>
                        </ProtectedComponent>
                    )}


                    {collapsed ? (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <SubMenu label="Reportes" icon={<AssessmentIcon />}>
                                <Link className={styles.tWhite} href="/ListaReportes" passHref>
                                    <MenuItem icon={<AssessmentIcon />} className={styles.bgblack} onClick={handleLinkClick}>Reportes</MenuItem>
                                </Link>
                            </SubMenu>
                        </ProtectedComponent>
                    ) : (
                        <ProtectedComponent userPermissions={permissions}
                            requiredPermissions={['Acceso_total']}
                        >
                            <Link className={styles.textAlone} href="/ListaReportes" passHref>
                                <MenuItem icon={<AssessmentIcon />} onClick={handleLinkClick}>Reportes</MenuItem>
                            </Link>
                        </ProtectedComponent>
                    )}
                </Menu>
            </Sidebar>
        </div>
    );
}