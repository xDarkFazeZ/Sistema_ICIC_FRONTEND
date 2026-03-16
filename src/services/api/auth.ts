import { apiClient } from './client';
import type { LoginResponse } from '../../types/auth.types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });

      const data = response.data;

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      if (err.response?.status === 401) {
        throw new Error('Credenciales inválidas');
      }
      if (err.response?.status === 403) {
        throw new Error('Usuario desactivado');
      }
      if (err.code === 'ERR_NETWORK') {
        throw new Error('No se pudo conectar con el servidor');
      }
      throw new Error('Error al iniciar sesión');
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async checkAuth(): Promise<LoginResponse['user'] | null> {
    try {
      const response = await apiClient.get('/auth/check');

      if (response.data.success && response.data.authenticated) {
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      return null;
    } catch (_) {
      this.logout();
      return null;
    }
  },

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};