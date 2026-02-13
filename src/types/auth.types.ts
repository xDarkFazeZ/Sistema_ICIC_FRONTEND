// Basado en la respuesta de tu backend
export interface User {
  id: number;
  correo: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fullName: string;
  rol: {
    id: number;
    nombre: string;
  };
  activo: boolean;
  ultimoLogin?: Date;
  permissions: Permissions;
}

export interface Permissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManagePayment: boolean;
  canSendEmail: boolean;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  expiresIn: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}