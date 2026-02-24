import { apiClient } from "./api/client";

export const buscarInstructores = async (search: string) => {
  const res = await apiClient.get("/instructores", {
    params: { search, limit: 10 },
  });
  return res.data.data ?? [];
};

export const obtenerInstructorPorId = async (id: number) => {
  const res = await apiClient.get(`/instructores/${id}`);
  return res.data.data;
};

export const crearInstructor = async (data: any) => {
  const res = await apiClient.post("/instructores", data);
  return res.data.data;
};

export const actualizarInstructor = async (id: number, data: any) => {
  const res = await apiClient.put(`/instructores/${id}`, data);
  return res.data.data;
};