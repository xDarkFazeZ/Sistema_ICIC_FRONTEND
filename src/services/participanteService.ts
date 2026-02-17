import { apiClient } from "./api/client";

export const crearParticipante = async (data: any) => {
  const res = await apiClient.post("/participantes", data);
  return res.data;
};
