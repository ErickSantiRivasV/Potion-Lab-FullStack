import api from "../api/axios";
import { especialidadAFrontend } from "../utils/mappers";

function mapearUsuario(usuario) {
  return {
    id: usuario._id,
    name: usuario.nombre,
    email: usuario.email,
    specialty: especialidadAFrontend(usuario.specialty),
    role: usuario.role,
  };
}

export const userService = {
  listar: async () => {
    const r = await api.get("/users");
    return r.data.usuarios.map(mapearUsuario);
  },
  eliminar: async (id) => {
    await api.delete(`/users/${id}`);
  },
};
