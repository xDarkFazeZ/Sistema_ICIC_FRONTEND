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

export const obtenerCursoCompletoParaPDF = async (id: number) => {
  try {
    // 1. Obtener el curso con instructor
    const curso = await obtenerCursoPorId(id);
    
    // 2. Obtener inscripciones con participantes y empresas
    const inscripcionesRes = await apiClient.get("/inscripciones", {
      params: { cursoId: id }
    });
    
    const inscripciones = inscripcionesRes.data.data || [];
    
    // 3. Para cada inscripción, obtener datos completos del participante y empresa
    const participantesConDatos = await Promise.all(
      inscripciones.map(async (inscripcion: any) => {
        // Obtener participante con su empresa
        const participanteRes = await apiClient.get(`/participantes/${inscripcion.participanteId}`);
        const participante = participanteRes.data.data;
        
        let empresa = null;
        if (participante.empresaId) {
          const empresaRes = await apiClient.get(`/empresas/${participante.empresaId}`);
          empresa = empresaRes.data.data;
        }
        
        return {
          ...inscripcion,
          participante,
          empresa
        };
      })
    );
    
    return {
      ...curso,
      inscripciones: participantesConDatos
    };
  } catch (error) {
    console.error('Error obteniendo curso completo:', error);
    throw error;
  }
};