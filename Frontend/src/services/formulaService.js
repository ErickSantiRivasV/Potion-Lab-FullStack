import api from "../api/axios";
import { aCuerpoFormula, mapearFormula } from "../utils/mappers";

export const formulaService = {
  listar: async ({ guildId, state } = {}) => {
    const params = {};

    if (guildId) params.guildId = guildId;
    if (state) params.state = state;

    const respuesta = await api.get("/formulas", { params });

    return respuesta.data.formulas.map(mapearFormula);
  },

  obtener: async (id) => {
    const respuesta = await api.get(`/formulas/${id}`);

    return mapearFormula(respuesta.data.formula);
  },

  crear: async (datos) => {
    const respuesta = await api.post("/formulas", aCuerpoFormula(datos));

    return mapearFormula(respuesta.data.formula);
  },

  actualizar: async (id, datos) => {
    const respuesta = await api.put(`/formulas/${id}`, aCuerpoFormula(datos));

    return mapearFormula(respuesta.data.formula);
  },

  eliminar: async (id) => {
    await api.delete(`/formulas/${id}`);
  },

  votar: async (id, categoria, opcion) => {
    const respuesta = await api.post(`/formulas/${id}/vote`, {
      category: categoria,
      option: opcion,
    });

    return mapearFormula(respuesta.data.formula);
  },

  usarVeto: async (id, categoria, opcion) => {
    const r = await api.post(`/formulas/${id}/veto`, { category: categoria, option: opcion });
    return mapearFormula(r.data.formula);
  },
  cambiarEstado: async (id, estado) => {
    const respuesta = await api.patch(`/formulas/${id}/state`, {
      state: estado,
    });

    return mapearFormula(respuesta.data.formula);
  },
};
