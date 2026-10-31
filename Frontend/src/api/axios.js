import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Adjunta el JWT a las peticiones que requieren autenticación.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Si el token deja de ser válido, limpia la sesión sin interrumpir
// los errores normales de credenciales en login o registro.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const endpoint = error.config?.url || "";
    const esAutenticacion = endpoint.includes("/auth/login") ||
      endpoint.includes("/auth/register");

    if (error.response?.status === 401 && !esAutenticacion) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject(error);
  },
);

export default api;
