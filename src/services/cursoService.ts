import { apiClient } from "./api/client";

export const buscarCursos = async (search: string) => {
  if (!search || search.trim().length < 2) return [];

  const res = await apiClient.get(
    `/cursos?search=${search}`
  );

  return res.data.data;
};

export const obtenerCursoPorId = async (id: number) => {
  const res = await apiClient.get(`/cursos/${id}`);
  return res.data.data;
};
