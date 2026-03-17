// frontend/src/services/inscripcionService.ts
import { apiClient } from "./api/client";

export const crearInscripcion = async (data: any) => {
  const res = await apiClient.post("/inscripciones", data);
  return res.data;
};

export const actualizarInscripcion = async (id: number, data: any) => {
  const res = await apiClient.put(`/inscripciones/${id}`, data);
  return res.data;
};

export const obtenerInscripcion = async (id: number) => {
  const res = await apiClient.get(`/inscripciones/${id}`);
  return res.data;
};

export const obtenerInscripciones = async (params?: any) => {
  const res = await apiClient.get("/inscripciones", { params });
  return res.data;
};

export const obtenerInscripcionesPorParticipante = async (participanteId: number) => {
  const res = await apiClient.get(`/inscripciones/participante/${participanteId}`);
  return res.data;
};

export const eliminarInscripcion = async (id: number) => {
  const res = await apiClient.delete(`/inscripciones/${id}`);
  return res.data;
};

export const obtenerInscripcionesPorCurso = async (cursoId: number) => {
  const res = await apiClient.get("/inscripciones", { params: { cursoId } });
  return res.data;
};