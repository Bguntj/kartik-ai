import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});


// ==========================================
// Attach JWT token
// ==========================================

API.interceptors.request.use((config) => {

  const token = localStorage.getItem("access_token");

  if (token) {

    config.headers.Authorization =
      `Bearer ${token}`;

  }

  return config;

});


// ==========================================
// Handle expired / invalid JWT
// ==========================================

API.interceptors.response.use(

  (response) => response,

  (error) => {

    if (error.response?.status === 401) {

      console.log(
        "🔐 Authentication expired. Logging out..."
      );

      localStorage.removeItem(
        "access_token"
      );

      window.dispatchEvent(
        new Event("auth:logout")
      );

    }

    return Promise.reject(error);

  }

);


export default API;