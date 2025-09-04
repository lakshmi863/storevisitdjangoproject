import axios from "axios";

const api = axios.create({
  baseURL: "https://storevisitdjangoproject-demo-task.onrender.com/",
});

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem("refresh");
        const res = await axios.post("https://storevisitdjangoproject-demo-task.onrender.com/api/token/refresh/", {
          refresh,
        });

        localStorage.setItem("access", res.data.access);
        api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;

        return api(originalRequest);
      } catch (err) {
        console.error("Refresh token expired, please log in again");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login"; // redirect to login
      }
    }

    return Promise.reject(error);
  }
);

export default api;
