// src/api/axios.js
import axios from "axios";

const resolvedApiBaseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

const normalizedApiBaseUrl = resolvedApiBaseUrl.replace(/\/+$/, "");
const backendBaseUrl = normalizedApiBaseUrl.endsWith("/api")
  ? normalizedApiBaseUrl.slice(0, -4)
  : normalizedApiBaseUrl;

const API = axios.create({
  baseURL: normalizedApiBaseUrl,
});

export const getBackendAssetUrl = (path = "") => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = `/${String(path).replace(/^\/+/, "")}`;
  return `${backendBaseUrl}${cleanPath}`;
};

API.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
