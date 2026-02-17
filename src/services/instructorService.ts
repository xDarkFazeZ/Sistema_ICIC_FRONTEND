import { apiClient } from "./api/client";

export const buscarInstructores = async (search: string) => {
  if (!search || search.trim().length < 2) return [];

  const res = await apiClient.get(
    `/instructores?search=${search}`
  );

  return res.data.data;
};

export const obtenerInstructorPorId = async (id: number) => {
  const res = await apiClient.get(`/instructores/${id}`);
  return res.data.data;
};
