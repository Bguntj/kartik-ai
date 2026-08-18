import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000",

  headers: {
    "Content-Type": "application/json",
  },
});


// ==========================================
// Attach JWT token
// ==========================================

API.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("access_token");

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ==========================================
// Handle JWT expiration
// ==========================================

API.interceptors.response.use(

  (response) => response,

  (error) => {

    const status =
      error.response?.status;

    const requestURL =
      error.config?.url || "";


    // ==========================================
    // Only logout for protected API requests
    // ==========================================

    const isAuthEndpoint =
      requestURL.startsWith("/auth/login") ||
      requestURL.startsWith("/auth/register") ||
      requestURL.startsWith("/auth/verify-otp") ||
      requestURL.startsWith("/auth/resend-otp") ||
      requestURL.startsWith("/auth/forgot-password") ||
      requestURL.startsWith("/auth/reset-password");


    if (
      status === 401 &&
      !isAuthEndpoint
    ) {

      console.log(
        "Authentication expired. Logging out..."
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