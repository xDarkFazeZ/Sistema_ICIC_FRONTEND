import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; // 👈 importación de tipo
import { authService } from '../services/api/auth';
import type { User, AuthState } from '../types/auth.types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: authService.getStoredUser(),
    token: authService.getToken(),
    isLoading: true,
    isAuthenticated: authService.isAuthenticated(),
    error: null,
  });

  useEffect(() => {
    const verifyAuth = async () => {
      if (state.token) {
        const user = await authService.checkAuth();
        if (!user) {
          setState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        } else {
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
          }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    verifyAuth();
  }, [state.token]); // 👈 dependencia agregada

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authService.login(email, password);
      setState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  };

  const checkAuth = async (): Promise<boolean> => {
    const user = await authService.checkAuth();
    if (user) {
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}