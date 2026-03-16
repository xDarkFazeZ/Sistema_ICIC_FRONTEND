import { apiClient } from "./api/client";

export interface CursoQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const listarCursos = async (params?: CursoQueryParams) => {
  const res = await apiClient.get("/cursos", { params });
  return res.data;
};

export const obtenerCursoPorId = async (id: number) => {
  const res = await apiClient.get(`/cursos/${id}`);
  return res.data.data;
};

export const eliminarCurso = async (id: number) => {
  const res = await apiClient.delete(`/cursos/${id}`);
  return res.data;
};

export const activarCurso = async (id: number) => {
  const res = await apiClient.patch(`/cursos/${id}/activate`);
  return res.data;
};

export const desactivarCurso = async (id: number) => {
  const res = await apiClient.patch(`/cursos/${id}/deactivate`);
  return res.data;
};

export const validarCursoBackend = async (data: any, isUpdate = false) => {
  const url = isUpdate ? "/cursos/validate-update" : "/cursos/validate";
  const res = await apiClient.post(url, data);
  return res.data;
};

export const crearCurso = async (data: any) => {
  console.log("PAYLOAD ENVIADO:", JSON.stringify(data, null, 2)); // ← agrega esto
  const res = await apiClient.post("/cursos", data);
  return res.data.data;
};

export const actualizarCurso = async (id: number, data: any) => {
  const res = await apiClient.put(`/cursos/${id}`, data);
  return res.data.data;
};