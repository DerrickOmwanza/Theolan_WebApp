import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import App from "./App.jsx";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes before refetching
      staleTime: 5 * 60 * 1000,
      // Cache for 1 hour before garbage collection
      gcTime: 60 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch when window regains focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Background refetch interval (disabled by default)
      refetchInterval: false,
      // Error retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once on network error
      retry: 1,
      // Invalidate related queries on mutation success
      onSuccess: (data, variables, context) => {
        // Default: invalidate all queries
        queryClient.invalidateQueries();
      },
    },
  },
});

// ============================================================
// Query Keys - Centralized for consistent caching
// ============================================================

export const queryKeys = {
  products: (filters) => ["products", filters],
  gallery: (filters) => ["gallery", filters],
  quote: (params) => ["quote", params],
  availableSlots: (date) => ["availableSlots", date],
  orders: (userId, filters) => ["orders", userId, filters],
  order: (orderId) => ["order", orderId],
  bookings: (userId, filters) => ["bookings", userId, filters],
  payment: (checkoutRequestId) => ["payment", checkoutRequestId],
  adminOrders: (filters) => ["adminOrders", filters],
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#232932",
                color: "#F5F4F0",
                borderRadius: "0.5rem",
                border: "1px solid #414B55",
              },
              success: {
                iconTheme: { primary: "#0055CC", secondary: "#F5F4F0" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "#F5F4F0" },
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
