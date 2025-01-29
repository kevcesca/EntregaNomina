import React from 'react'
import CrudRoles from '../%Components/CrudRoles/CrudRoles'
import ProtectedView from '../%Components/ProtectedView/ProtectedView';


export default function page() {
  return (
    <ProtectedView requiredPermissions={["Gestion_Usuarios", "Acceso_total"]}>
      <div>
        <CrudRoles />
      </div>
    </ProtectedView>

  )
}
