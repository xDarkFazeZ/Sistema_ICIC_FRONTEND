import { apiClient } from "./api/client";

export const fecapService = {
  // Obtener todas las empresas con su saldo
  getEmpresasConSaldo: async () => {
    const { data } = await apiClient.get("/fecap/empresas");
    return data.data;
  },

  // Obtener saldo de una empresa específica
  getSaldoEmpresa: async (empresaId: number) => {
    const { data } = await apiClient.get(`/fecap/empresa/${empresaId}/saldo`);
    return data.data;
  },

  // Obtener historial de movimientos de una empresa
  getHistorial: async (empresaId: number, page = 1, limit = 20) => {
    const { data } = await apiClient.get(
      `/fecap/empresa/${empresaId}/historial?page=${page}&limit=${limit}`
    );
    return data;
  },

  // Confirmar carga de saldo FECAP
  cargarSaldo: async (empresaId: number, monto: number) => {
    const { data } = await apiClient.post("/fecap/cargar", { empresaId, monto });
    return data;
  },
};