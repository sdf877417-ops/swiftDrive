import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 120000,
});

let refreshPromise: Promise<void> | null = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean });
    const url = String(original?.url || "");
    if (error.response?.status === 401 && original && !original._retry && !url.includes("/auth/login") && !url.includes("/auth/register") && !url.includes("/auth/refresh")) {
      original._retry = true;
      try {
        refreshPromise ??= api.post("/auth/refresh").then(() => undefined).finally(() => { refreshPromise = null; });
        await refreshPromise;
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
export default api;
