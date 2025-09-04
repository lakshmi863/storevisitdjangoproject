import axios from "axios";

const API = axios.create({
  baseURL: "https://storevisitdjangoproject-demo-task.onrender.com/",
});

// Add token to headers automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("access");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
