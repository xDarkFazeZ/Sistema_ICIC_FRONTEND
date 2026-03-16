import { apiClient } from "./api/client";

export const buscarInstructores = async (search: string) => {
  try {
    const res = await apiClient.get("/instructores", {
      params: { search, limit: 10 },
    });
    return res.data.data ?? [];
  } catch (error) {
    console.error('❌ Error en buscarInstructores:', error);
    throw error;
  }
};

export const obtenerInstructorPorId = async (id: number) => {
  try {
    const res = await apiClient.get(`/instructores/${id}`);
    return res.data.data;
  } catch (error) {
    console.error('❌ Error en obtenerInstructorPorId:', error);
    throw error;
  }
};

export const crearInstructor = async (data: any) => {
  try {
    // Limpiar datos antes de enviar
    const payload = { ...data };
    
    // Si fechaNacimiento es string vacío, eliminarlo completamente
    if (payload.fechaNacimiento === '') {
      delete payload.fechaNacimiento; // 👈 No enviar el campo
    }
    
    console.log('📤 Enviando payload a crear:', payload);
    const res = await apiClient.post("/instructores", payload);
    return res.data.data;
  } catch (error) {
    console.error('❌ Error en crearInstructor:', error);
    throw error;
  }
};

export const actualizarInstructor = async (id: number, data: any) => {
  try {
    // Limpiar datos antes de enviar
    const payload = { ...data };
    
    // Si fechaNacimiento es string vacío, enviar null para limpiar
    if (payload.fechaNacimiento === '') {
      payload.fechaNacimiento = null;
    }
    
    console.log('📤 Enviando payload a actualizar:', payload);
    const res = await apiClient.put(`/instructores/${id}`, payload);
    return res.data.data;
  } catch (error) {
    console.error('❌ Error en actualizarInstructor:', error);
    throw error;
  }
};

export const eliminarInstructor = async (id: number) => {
  try {
    const res = await apiClient.delete(`/instructores/${id}`);
    return res.data;
  } catch (error) {
    console.error('❌ Error en eliminarInstructor:', error);
    throw error;
  }
};

export const obtenerCursosInstructor = async (id: number) => {
  try {
    const res = await apiClient.get(`/instructores/${id}/cursos`);
    return res.data.data;
  } catch (error) {
    console.error('❌ Error en obtenerCursosInstructor:', error);
    throw error;
  }
};