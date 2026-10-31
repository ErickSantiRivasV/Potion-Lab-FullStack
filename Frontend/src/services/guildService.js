import api from "../api/axios";
import { aCuerpoGremio, mapearGremio } from "../utils/mappers";

export const guildService = {
  listar: async (tipo) => {
    const respuesta = await api.get("/guilds", {
      params: tipo ? { type: tipo } : {},
    });

    return respuesta.data.gremios.map(mapearGremio);
  },

  obtener: async (id) => {
    const respuesta = await api.get(`/guilds/${id}`);

    return mapearGremio(respuesta.data.gremio);
  },

  crear: async (datos) => {
    const respuesta = await api.post("/guilds", aCuerpoGremio(datos));

    return mapearGremio(respuesta.data.gremio);
  },

  actualizar: async (id, datos) => {
    const respuesta = await api.put(`/guilds/${id}`, aCuerpoGremio(datos));

    return mapearGremio(respuesta.data.gremio);
  },

  eliminar: async (id) => {
    await api.delete(`/guilds/${id}`);
  },

  unirse: async (id, inviteCode) => {
    const cuerpo = inviteCode ? { inviteCode: inviteCode.trim() } : {};
    const respuesta = await api.post(`/guilds/${id}/join`, cuerpo);

    return mapearGremio(respuesta.data.gremio);
  },

  salir: async (id) => {
    await api.post(`/guilds/${id}/leave`);
  },

  cambiarRol: async (id, usuarioId, role) => {
    const respuesta = await api.patch(
      `/guilds/${id}/members/${usuarioId}/role`,
      { role },
    );

    return mapearGremio(respuesta.data.gremio);
  },
};
