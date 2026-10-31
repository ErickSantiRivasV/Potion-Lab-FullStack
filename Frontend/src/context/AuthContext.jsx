import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

const ESPECIALIDADES_BACKEND = {
  Herbalist: "Botany",
  Runist: "Runes",
  Taster: "Alchemy",
  Brewmaster: "Brewing",
  Enchanting: "Enchanting",
};

const ESPECIALIDADES_FRONTEND = {
  Botany: "Herbalist",
  Runes: "Runist",
  Alchemy: "Taster",
  Brewing: "Brewmaster",
  Enchanting: "Enchanting",
};

function prepararUsuario(usuario) {
  if (!usuario) return null;

  return {
    ...usuario,
    id: usuario._id || usuario.id,
    name: usuario.nombre || usuario.name,
    specialty: ESPECIALIDADES_FRONTEND[usuario.specialty] || usuario.specialty,
  };
}

function obtenerMensajeError(error, mensajePredeterminado) {
  return error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    mensajePredeterminado;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  useEffect(() => {
    let activo = true;

    async function verificarSesion() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (activo) setLoading(false);
        return;
      }

      try {
        const respuesta = await authService.perfil();

        if (activo) {
          const usuario = prepararUsuario(respuesta.usuario);
          setUser(usuario);
          localStorage.setItem("user", JSON.stringify(usuario));
        }
      } catch {
        if (activo) logout();
      } finally {
        if (activo) setLoading(false);
      }
    }

    verificarSesion();

    function manejarSesionExpirada() {
      logout();
      setLoading(false);
    }

    window.addEventListener("auth:unauthorized", manejarSesionExpirada);

    return () => {
      activo = false;
      window.removeEventListener("auth:unauthorized", manejarSesionExpirada);
    };
  }, [logout]);

  const login = useCallback(
    async (email, password) => {
      try {
        const respuesta = await authService.login({
          email: email.trim().toLowerCase(),
          password,
        });

        const usuario = prepararUsuario(respuesta.usuario);

        localStorage.setItem("token", respuesta.token);
        localStorage.setItem("user", JSON.stringify(usuario));
        setUser(usuario);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: obtenerMensajeError(
            error,
            "No fue posible iniciar sesión.",
          ),
        };
      }
    },
    [],
  );

  const register = useCallback(
    async (nombre, email, password, specialty, avatar) => {
      try {
        const respuesta = await authService.registrar({
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          password,
          specialty: ESPECIALIDADES_BACKEND[specialty] || specialty,
          avatar: avatar.trim(),
        });

        const usuario = prepararUsuario(respuesta.usuario);

        localStorage.setItem("token", respuesta.token);
        localStorage.setItem("user", JSON.stringify(usuario));
        setUser(usuario);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          message: obtenerMensajeError(
            error,
            "No fue posible crear la cuenta.",
          ),
        };
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
