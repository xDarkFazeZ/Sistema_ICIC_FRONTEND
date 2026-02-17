import { apiClient } from "./api/client";

export const buscarEmpresas = async (search: string) => {
  const clean = search?.trim();

  if (!clean || clean.length < 2) {
    return [];
  }

  try {
    const res = await apiClient.get(
      `/empresas/buscar?search=${encodeURIComponent(clean)}`
    );

    return res.data.data || [];
  } catch (error) {
    console.warn("Error buscando empresas:", error);
    return [];
  }
};
