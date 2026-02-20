import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from "@heroui/react";

interface Permissions {
  // Define aquí la estructura de tus permisos
  [key: string]: boolean;
}

interface ProtectedRouteProps {
  requiredRole?: string;
  requiredPermission?: keyof Permissions;
}

export default function ProtectedRoute({ 
  requiredRole, 
  requiredPermission 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner 
          size="lg" 
          label="Cargando..." 
          color="danger"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole && user?.rol?.nombre !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar permiso si es requerido (con validación segura)
  if (requiredPermission && !user?.permissions?.[requiredPermission]) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}