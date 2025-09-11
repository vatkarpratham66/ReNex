// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // update if your backend URL differs
});

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
