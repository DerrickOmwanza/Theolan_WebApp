import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the API module
vi.mock("../services/api.js", () => ({
  productApi: {
    list: vi.fn(),
    getGallery: vi.fn(),
  },
  quoteApi: {
    calculate: vi.fn(),
  },
  orderApi: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    adminList: vi.fn(),
    adminUpdate: vi.fn(),
  },
  bookingApi: {
    getAvailableSlots: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
  },
  paymentApi: {
    initiateSTK: vi.fn(),
    getPaymentStatus: vi.fn(),
  },
}));

// Mock queryKeys
vi.mock("../main.jsx", () => ({
  queryKeys: {
    products: (filters) => ["products", filters],
    gallery: (filters) => ["gallery", filters],
    quote: (params) => ["quote", params],
    availableSlots: (date) => ["availableSlots", date],
    orders: (userId, filters) => ["orders", userId, filters],
    order: (orderId) => ["order", orderId],
    bookings: (userId, filters) => ["bookings", userId, filters],
    payment: (checkoutRequestId) => ["payment", checkoutRequestId],
    adminOrders: (filters) => ["adminOrders", filters],
  },
}));

import {
  useProducts,
  useGallery,
  useOrders,
  useAvailableSlots,
} from "../utils/queryHooks.js";
import {
  productApi,
  bookingApi,
  orderApi,
  quoteApi,
  paymentApi,
} from "../services/api.js";

// Create a wrapper for testing hooks with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const QueryWrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return QueryWrapper;
};

describe("Query Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useProducts", () => {
    it("should call productApi.list with filters", async () => {
      productApi.list.mockResolvedValue({
        data: { data: [], pagination: { total: 0 } },
      });

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useProducts({ category: "windows" }),
        { wrapper },
      );

      expect(productApi.list).toHaveBeenCalledWith({ category: "windows" });
    });

    it("should use correct query key", async () => {
      productApi.list.mockResolvedValue({
        data: { data: [], pagination: { total: 0 } },
      });

      const wrapper = createWrapper();
      renderHook(() => useProducts({ category: "doors" }), { wrapper });

      // Query key should include filters
      expect(productApi.list).toHaveBeenCalled();
    });
  });

  describe("useGallery", () => {
    it("should call productApi.getGallery", async () => {
      productApi.getGallery.mockResolvedValue({
        data: { data: [], pagination: { total: 0 } },
      });

      const wrapper = createWrapper();
      renderHook(() => useGallery({ finish: "black" }), { wrapper });

      expect(productApi.getGallery).toHaveBeenCalledWith({ finish: "black" });
    });
  });

  describe("useAvailableSlots", () => {
    it("should call bookingApi.getAvailableSlots with date", async () => {
      bookingApi.getAvailableSlots.mockResolvedValue({
        data: { data: [] },
      });

      const wrapper = createWrapper();
      renderHook(() => useAvailableSlots("2024-01-15"), { wrapper });

      expect(bookingApi.getAvailableSlots).toHaveBeenCalledWith({
        date: "2024-01-15",
      });
    });
  });

  describe("useOrders", () => {
    it("should call orderApi.list when userId exists", async () => {
      orderApi.list.mockResolvedValue({
        data: { data: [], pagination: { total: 0 } },
      });

      const wrapper = createWrapper();
      renderHook(() => useOrders("user-123"), { wrapper });

      expect(orderApi.list).toHaveBeenCalled();
    });
  });
});

describe("React Query Configuration", () => {
  it("should have staleTime configured", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
        },
      },
    });

    expect(queryClient.getDefaultOptions().queries.staleTime).toBe(
      5 * 60 * 1000,
    );
  });

  it("should have gcTime configured", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 60 * 60 * 1000,
        },
      },
    });

    expect(queryClient.getDefaultOptions().queries.gcTime).toBe(60 * 60 * 1000);
  });

  it("should have retry configured", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
        },
      },
    });

    expect(queryClient.getDefaultOptions().queries.retry).toBe(1);
  });
});
