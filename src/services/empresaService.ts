// services/empresaService.ts
import { apiClient } from "./api/client";

export const buscarEmpresas = async (search: string) => {
  const clean = search?.trim();

  if (!clean || clean.length < 2) {
    return [];
  }

  try {
    const res = await apiClient.get(
      `/empresas/buscar?search=${encodeURIComponent(clean)}`
    );

    return res.data.data || [];
  } catch (error) {
    console.warn("Error buscando empresas:", error);
    return [];
  }
};

export const crearEmpresa = async (data: {
  nombre: string;
  rfc: string;
  direccion: string;
}) => {
  const res = await apiClient.post("/empresas", data);
  return res.data;
};

// ✅ NUEVA FUNCIÓN: Obtener una empresa por ID
export const obtenerEmpresa = async (id: number) => {
  try {
    const res = await apiClient.get(`/empresas/${id}`);
    return res.data.data; // Asumiendo que la respuesta es { success: true, data: empresa }
  } catch (error) {
    console.warn(`Error obteniendo empresa ${id}:`, error);
    throw error;
  }
};

// ✅ FUNCIÓN OPCIONAL: Listar empresas con paginación
export const listarEmpresas = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  const res = await apiClient.get("/empresas", { params });
  return res.data;
};

// ✅ FUNCIÓN OPCIONAL: Actualizar empresa
export const actualizarEmpresa = async (id: number, data: {
  nombre?: string;
  rfc?: string;
  direccion?: string;
}) => {
  const res = await apiClient.put(`/empresas/${id}`, data);
  return res.data;
};

// ✅ FUNCIÓN OPCIONAL: Eliminar empresa
export const eliminarEmpresa = async (id: number) => {
  const res = await apiClient.delete(`/empresas/${id}`);
  return res.data;
};