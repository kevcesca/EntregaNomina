import React from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";

const ConfirmToggleUsersModal = ({
    isOpen,
    onClose,
    onConfirm,
    usersToToggle,
    isEnabling,
}) => {
    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isEnabling
                    ? "Confirmar Habilitación de Usuarios"
                    : "Confirmar Deshabilitación de Usuarios"}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Los siguientes usuarios serán{" "}
                    {isEnabling ? "habilitados" : "deshabilitados"}:
                </Typography>
                <List>
                    {usersToToggle.map((user) => (
                        <ListItem key={user["ID Empleado"]}>
                            <ListItemText
                                primary={`${user["Nombre Empleado"]} (${user["Nombre de Usuario"]})`}
                                secondary={`Email: ${user.Email}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    color="primary"
                    variant="contained"
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ConfirmToggleUsersModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    usersToToggle: PropTypes.array.isRequired,
    isEnabling: PropTypes.bool.isRequired,
};

export default ConfirmToggleUsersModal;
