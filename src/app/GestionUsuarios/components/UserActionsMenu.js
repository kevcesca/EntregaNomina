import React from 'react';
import { Menu, MenuItem } from '@mui/material';

const UserActionsMenu = ({ anchorEl, open, onClose, onToggleStatus, isActive, onChangePassword }) => {
    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            {isActive ? (
                <MenuItem onClick={onToggleStatus}>Deshabilitar Usuario</MenuItem>
            ) : (
                <MenuItem onClick={onToggleStatus}>Habilitar Usuario</MenuItem>
            )}
            <MenuItem onClick={onChangePassword}>Cambiar Contraseña</MenuItem> {/* Nueva opción */}
        </Menu>
    );
};

export default UserActionsMenu;
