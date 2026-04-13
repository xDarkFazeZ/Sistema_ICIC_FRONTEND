// frontend/src/services/dashboardService.ts
import { apiClient } from "./api/client";

export interface InscripcionMes {
  mes: string;
  total: number;
}

export interface IngresoPorMes {
  mes: string;
  total: number;
}

export interface DistribucionCurso {
  nombre: string;
  total: number;
}

export interface CursoEstado {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'PROXIMO' | 'EN_CURSO' | 'TERMINADO';
  aula?: string;
  instructor?: {
    nombre: string;
    apellidoPaterno: string;
  };
  inscritos: number;
  // ← Agregar esto
  participantes?: Array<{
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  }>;
}

export interface PagoPendiente {
  id: number;
  participante: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    correo?: string;
    celular?: string;
  };
  curso: {
    nombre: string;
    fechaInicio: string;
  };
  montoEsperado: number;
  estadoPago: string;
  inscritoEn: string;
}

export interface DashboardData {
  inscripcionesPorMes: InscripcionMes[];
  distribucionCursos: DistribucionCurso[];
  cursosConEstado: CursoEstado[];
  pagosPendientes: PagoPendiente[];
  participantesSinPago: any[];
  saldoFecapPorMes: any[];
  horasHombrePorMes: any[];
  ingresosPorMesEfectivoTransferencia: IngresoPorMes[]; // ← NUEVO
}
export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    try {
      // Usamos apiClient que ya tiene el token en el interceptor
      const response = await apiClient.get('/dashboard');
      
      // La estructura de respuesta del backend
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Error al obtener datos');
      }
    } catch (error) {
      console.error('Error en dashboardService.getDashboardData:', error);
      throw error;
    }
  },

  async getInscripcionesPorMes() {
    try {
      const response = await apiClient.get('/dashboard/inscripciones-mes');
      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getInscripcionesPorMes:', error);
      throw error;
    }
  },

  async getDistribucionCursos() {
    try {
      const response = await apiClient.get('/dashboard/distribucion-cursos');
      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getDistribucionCursos:', error);
      throw error;
    }
  },

  async getPagosPendientes() {
    try {
      const response = await apiClient.get('/dashboard/pagos-pendientes');
      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getPagosPendientes:', error);
      throw error;
    }
  }
};