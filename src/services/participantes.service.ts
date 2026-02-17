import { apiClient } from "./api/client";

export const participantesService = {
  async getAll() {
    const res = await apiClient.get("/participantes");
    return res.data.data;
  },

  async create(data: any) {
    const res = await apiClient.post("/participantes", data);
    return res.data.data;
  },

  async delete(id: number) {
    await apiClient.delete(`/participantes/${id}`);
  },
};
