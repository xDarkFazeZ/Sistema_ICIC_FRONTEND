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