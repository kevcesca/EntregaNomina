'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../context/AuthContext'
import {
    AppBar as MuiAppBar,
    Toolbar,
    Tabs,
    Tab,
    Menu,
    MenuItem,
    Box,
    IconButton,
    Button,
    Container,
    styled,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import GroupIcon from '@mui/icons-material/Group'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'
import Assessment from '@mui/icons-material/Assessment'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
    backgroundColor: '#235b4e',
    border: '6px solid #bc955c',
    boxShadow: 'none',
    flexDirection: 'column',
}))

const StyledTabs = styled(Tabs)({
    '& .MuiTabs-indicator': {
        backgroundColor: '#9f2241',
    },
    '& .MuiTab-root': {
        color: '#ffffff',
        minWidth: 120,
        padding: '12px 24px',
        '&:hover': {
            backgroundColor: '#9f2241',
            borderRadius: '10px',
        },
        '&.Mui-selected': {
            color: '#ffffff',
        },
    },
})

const UserButton = styled(IconButton)({
    color: '#ffffff',
    textTransform: 'none',
    fontSize: '1rem',
    padding: '8px 16px',
    borderRadius: '8px',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
})

const HomeButton = styled(Button)({
    color: '#ffffff',
    textTransform: 'none',
    fontSize: '1rem',
    padding: '8px 16px',
    borderRadius: '8px',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
})

const NavigationContainer = styled(Container)({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    maxWidth: '100%',
})

export default function AppBar() {
    const [activeIndex, setActiveIndex] = useState(0)
    const [anchorEl, setAnchorEl] = useState(null)
    const { logout, user: currentUser } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = () => {
        handleMenuClose()
        logout()
    }

    const handleTabChange = (event, newValue) => {
        setActiveIndex(newValue)
        switch (newValue) {
            case 0:
                router.push('/CrearNomina')
                break
            case 1:
                router.push('/Empleados')
                break
        }
    }

    useEffect(() => {
        if (!router.isReady) return

        switch (pathname) {
            case '/CrearNomina':
                setActiveIndex(0)
                break
            case '/Empleados':
                setActiveIndex(1)
                break
            default:
                setActiveIndex(-1) // No tab selected if not on CrearNomina or Empleados
        }
    }, [router.isReady, pathname])

    return (
        <StyledAppBar position="static">
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Image
                    src="/logo.png"
                    alt="Logotipo Alcaldia Azcapotzalco"
                    width={1000}
                    height={500}
                    style={{ width: '100%', height: 'auto' }}
                />
            </Box>
            <NavigationContainer >
                <Toolbar sx={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Link href="/" passHref>
                        <HomeButton sx={{ width: '20vw' }} startIcon={<HomeIcon />}>
                            INICIO
                        </HomeButton>
                    </Link>

                    <Box>
                        <StyledTabs
                            value={activeIndex}
                            onChange={handleTabChange}
                            centered
                            sx={{width: '50vw', display: 'flex', justifyContent: 'space-between' }}
                        >
                            <Tab
                                icon={<Assessment />}
                                label="NÓMINA"
                                iconPosition="start"
                                sx={{width: '35vw', marginX: '4vw'}}
                            />
                            <Tab
                                icon={<GroupIcon />}
                                label="EMPLEADOS"
                                iconPosition="start"
                                sx={{width: '35vw', marginX: '4vw'}}
                            />
                        </StyledTabs>
                    </Box>

                    {currentUser && (
                        <UserButton
                            onClick={handleMenuClick}
                            endIcon={<KeyboardArrowDownIcon />}
                            sx={{ width: '20vw', padding: "1rem" }}
                        >
                            {currentUser.nombre_usuario}
                        </UserButton>
                    )}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleLogout}>
                            <ExitToAppIcon sx={{ mr: 1 }} />
                            Cerrar Sesión
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </NavigationContainer>
        </StyledAppBar>
    )
}

