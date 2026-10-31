import api from "../api/axios";

export const authService = {
  registrar: async (datos) => {
    const response = await api.post("/auth/register", datos);
    return response.data;
  },

  login: async (datos) => {
    const response = await api.post("/auth/login", datos);
    return response.data;
  },

  perfil: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
