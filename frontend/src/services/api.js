import axios from "axios";

// ─────────────────────────────────────────────
// URL base del backend
// En local apunta a FastAPI, en producción a Railway
// ─────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ─────────────────────────────────────────────
// ENDPOINTS
// ─────────────────────────────────────────────

// Lista de los 32 estados
export const getEstados = async () => {
  const { data } = await api.get("/api/estados");
  return data.estados;
};

// Lista de años disponibles
export const getAnios = async () => {
  const { data } = await api.get("/api/años");
  return data.años;
};

// Datos de delitos con filtros opcionales
export const getDelitos = async (estado = null, año = null) => {
  const params = {};
  if (estado) params.estado = estado;
  if (año)    params.año    = año;
  const { data } = await api.get("/api/delitos", { params });
  return data.datos;
};

// Resumen nacional por año
export const getResumen = async () => {
  const { data } = await api.get("/api/resumen");
  return data.datos;
};

// Tendencia anual de un estado específico
export const getTendencia = async (estado) => {
  const { data } = await api.get(`/api/tendencia/${encodeURIComponent(estado)}`);
  return data;
};

// Resultados del K-Means
export const getKmeans = async (zona = null) => {
  const params = {};
  if (zona) params.zona = zona;
  const { data } = await api.get("/api/kmeans", { params });
  return data.datos;
};

// Comparación entre dos estados
export const getComparar = async (estado1, estado2) => {
  const { data } = await api.get("/api/comparar", {
    params: { estado1, estado2 },
  });
  return data.comparacion;
};