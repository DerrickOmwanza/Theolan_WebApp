import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

/**
 * Axios instance configured for the The Olan Glass and Aluminium API.
 * Handles JWT token injection and automatic refresh on 401.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token storage keys
const TOKEN_KEYS = {
  access: "olan_access_token",
  refresh: "olan_refresh_token",
  user: "olan_user",
};

// ============================================================
// Token Helpers
// ============================================================

export const getAccessToken = () => localStorage.getItem(TOKEN_KEYS.access);
export const getRefreshToken = () => localStorage.getItem(TOKEN_KEYS.refresh);
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEYS.user));
  } catch {
    return null;
  }
};

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem(TOKEN_KEYS.access, accessToken);
  if (refreshToken) {
    localStorage.setItem(TOKEN_KEYS.refresh, refreshToken);
  }
};

export const setUser = (user) => {
  localStorage.setItem(TOKEN_KEYS.user, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEYS.access);
  localStorage.removeItem(TOKEN_KEYS.refresh);
  localStorage.removeItem(TOKEN_KEYS.user);
};

// ============================================================
// Request Interceptor — Inject JWT
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================================
// Response Interceptor — Auto-refresh on 401
// ============================================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuth();
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refresh_token: refreshToken,
          },
        );

        const newAccessToken = data.data.access_token;
        const newRefreshToken = data.data.refresh_token;

        setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ============================================================
// API Methods — Auth
// ============================================================

export const authApi = {
  signup: (data) => api.post("/auth/signup", data),
  verifyOtp: (data) => api.post("/auth/verify-otp", data),
  login: (data) => api.post("/auth/login", data),
  refreshToken: (refreshToken) =>
    api.post("/auth/refresh-token", { refresh_token: refreshToken }),
  logout: (refreshToken) =>
    api.post("/auth/logout", { refresh_token: refreshToken }),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

// ============================================================
// API Methods — Bookings
// ============================================================

export const bookingApi = {
  getAvailableSlots: (params) =>
    api.get("/bookings/available-slots", { params }),
  create: (data) => api.post("/bookings", data),
  list: (params) => api.get("/bookings", { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.patch(`/bookings/${id}`, data),
  adminList: (params) => api.get("/bookings/admin", { params }), // Admin list all
};

// ============================================================
// API Methods — Products & Gallery
// ============================================================

export const productApi = {
  list: (params) => api.get("/products", { params }),
  getGallery: (params) => api.get("/products/gallery", { params }),
};

// ============================================================
// API Methods — Quote
// ============================================================

export const quoteApi = {
  calculate: (data) => api.post("/quote", data),
};

// ============================================================
// API Methods — Orders
// ============================================================

export const orderApi = {
  create: (data) => api.post("/orders", data),
  list: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  adminUpdate: (id, data) => api.patch(`/orders/${id}`, data),
  adminList: (params) => api.get("/admin/orders", { params }), // Admin list all orders
};

// ============================================================
// API Methods — Payments
// ============================================================

export const paymentApi = {
  initiateSTK: (data) => api.post("/payments/initiate-stk", data),
  getPaymentStatus: (checkoutRequestId) =>
    api.get(`/payments/status/${checkoutRequestId}`),
};

// ============================================================
// API Methods — Analytics (Admin)
// ============================================================

export const analyticsApi = {
  getRevenue: () => api.get("/admin/analytics/revenue"),
  getBookings: () => api.get("/admin/analytics/bookings"),
  getOrders: () => api.get("/admin/analytics/orders"),
  getDashboard: () => api.get("/admin/analytics/dashboard"),
};

export default api;
