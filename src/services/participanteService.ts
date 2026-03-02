import { apiClient } from "./api/client";

export const crearParticipante = async (data: any) => {
  const res = await apiClient.post("/participantes", data);
  return res.data;
};

export const actualizarParticipante = async (id: number, data: any) => {
  const res = await apiClient.put(`/participantes/${id}`, data);
  return res.data;
};

export const obtenerParticipante = async (id: number) => {
  const res = await apiClient.get(`/participantes/${id}`);
  return res.data;
};

export const obtenerParticipantes = async () => {
  const res = await apiClient.get("/participantes");
  return res.data;
};

export const eliminarParticipante = async (id: number) => {
  const res = await apiClient.delete(`/participantes/${id}`);
  return res.data;
};

export const buscarParticipantes = async (termino: string) => {
  const res = await apiClient.get(`/participantes/buscar?q=${termino}`);
  return res.data;
};