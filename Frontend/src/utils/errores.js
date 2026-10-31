export function obtenerMensajeError(error, mensajePredeterminado) {
  const mensajeApi = error.response?.data?.message || error.response?.data?.error;

  if (mensajeApi) return mensajeApi;

  if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
    return "No se pudo conectar con el servidor. Si acaba de despertar, espera unos segundos e inténtalo de nuevo.";
  }

  return mensajePredeterminado || error.message;
}
