import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from "@heroui/react";

interface protectedRouteProps {
  requiredRole?: string;
  requiredPermission?: keyof Permissions;
}

export default function ProtectedRoute({ 
  requiredRole, 
  requiredPermission 
}: protectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" label="Cargando..." />
    </div>
  );
}


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol si es requerido
  if (requiredRole && user?.rol.nombre !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar permiso si es requerido
  if (requiredPermission && !user?.permissions[requiredPermission]) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}