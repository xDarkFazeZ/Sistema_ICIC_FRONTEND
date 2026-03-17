import { apiClient } from "./api/client";

export const fecapService = {
  getEmpresasConSaldo: async () => {
    const { data } = await apiClient.get("/fecap/empresas");
    return data.data;
  },

  getSaldoEmpresa: async (empresaId: number) => {
    const { data } = await apiClient.get(`/fecap/empresa/${empresaId}/saldo`);
    return data.data;
  },

  getHistorial: async (empresaId: number, page = 1, limit = 20) => {
    const { data } = await apiClient.get(
      `/fecap/empresa/${empresaId}/historial?page=${page}&limit=${limit}`
    );
    return data;
  },

  cargarSaldo: async (empresaId: number, monto: number, concepto?: string) => {
    const { data } = await apiClient.post("/fecap/cargar", {
      empresaId,
      monto,
      concepto: concepto?.trim() || undefined,
    });
    return data;
  },
};