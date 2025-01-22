'use client';

import PropTypes from 'prop-types';

const ProtectedComponent = ({ userPermissions = [], requiredPermissions = [], children, hideIfNoAccess = true }) => {
    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    const hasAccess = requiredPermissions.some(permission => userPermissions.includes(permission));

    // Si no tiene acceso y se debe ocultar, no renderiza nada
    if (!hasAccess && hideIfNoAccess) {
        return null;
    }

    return <>{children}</>;
};

ProtectedComponent.propTypes = {
    userPermissions: PropTypes.arrayOf(PropTypes.string).isRequired, // Lista de permisos del usuario
    requiredPermissions: PropTypes.arrayOf(PropTypes.string).isRequired, // Permisos requeridos para mostrar el contenido
    children: PropTypes.node.isRequired, // Contenido protegido
    hideIfNoAccess: PropTypes.bool, // Si debe ocultar el contenido si no hay permisos
};

export default ProtectedComponent;
