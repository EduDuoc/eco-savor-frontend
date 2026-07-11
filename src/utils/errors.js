// Utilidad compartida para extraer un mensaje de error legible de una
// respuesta de axios/API, con fallback a un mensaje por defecto.
export function getErrorMessage(error, fallback) {
  return error.response?.data?.error || error.message || fallback;
}
