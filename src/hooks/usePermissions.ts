import { useAuth } from "./useAuth";
import type { Permissions } from "../types/auth.types";

export function usePermissions() {

  const { user } = useAuth();

  const permissions: Permissions =
    user?.permissions ?? {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canManagePayment: false,
      canSendEmail: false,
    };

  return {
    canCreate: permissions.canCreate,
    canRead: permissions.canRead,
    canUpdate: permissions.canUpdate,
    canDelete: permissions.canDelete,
    canManagePayment: permissions.canManagePayment,
    canSendEmail: permissions.canSendEmail,

    isAdmin: user?.rol?.nombre === "ADMIN",

    // helper para validar permisos dinámicos
    hasPermission: (permission: keyof Permissions) =>
      Boolean(permissions[permission]),
  };
}