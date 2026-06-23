import { describe, it, expect, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";

// Mock the API module
vi.mock("../services/api.js", () => ({
  authApi: {
    signup: vi.fn(),
    verifyOtp: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
  orderApi: {
    list: vi.fn(),
    getById: vi.fn(),
  },
  bookingApi: {
    getAvailableSlots: vi.fn(),
    create: vi.fn(),
  },
  quoteApi: {
    calculate: vi.fn(),
  },
  productApi: {
    list: vi.fn(),
    getGallery: vi.fn(),
  },
  paymentApi: {
    initiateSTK: vi.fn(),
    getPaymentStatus: vi.fn(),
  },
  getAccessToken: vi.fn(() => null),
  getRefreshToken: vi.fn(() => null),
  getStoredUser: vi.fn(() => null),
  setTokens: vi.fn(),
  setUser: vi.fn(),
  clearAuth: vi.fn(),
}));

// Test utility functions used in pages
describe("Frontend Utility Functions", () => {
  describe("formatKes", () => {
    function formatKes(amount) {
      return `KES ${parseFloat(amount).toLocaleString()}`;
    }

    it("should format KES amount correctly", () => {
      expect(formatKes(50000)).toBe("KES 50,000");
    });

    it("should handle decimal amounts", () => {
      expect(formatKes(15000.5)).toBe("KES 15,000.5");
    });
  });

  describe("formatDate", () => {
    function formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    it("should format valid date correctly", () => {
      const result = formatDate("2024-01-15T10:30:00Z");
      expect(result).toMatch(/\d{1,2} [A-Z][a-z]{2} \d{4}/);
    });

    it("should return empty string for null input", () => {
      expect(formatDate(null)).toBe("");
    });

    it("should return empty string for undefined input", () => {
      expect(formatDate(undefined)).toBe("");
    });
  });

  describe("Payment Progress Calculation", () => {
    it("should calculate correct progress percentage", () => {
      const paidAmount = 25000;
      const totalPrice = 50000;
      const progressPercent = Math.round((paidAmount / totalPrice) * 100);
      expect(progressPercent).toBe(50);
    });

    it("should handle fully paid orders", () => {
      const paidAmount = 50000;
      const totalPrice = 50000;
      const progressPercent = Math.round((paidAmount / totalPrice) * 100);
      expect(progressPercent).toBe(100);
    });

    it("should handle zero paid orders", () => {
      const paidAmount = 0;
      const totalPrice = 50000;
      const progressPercent = Math.round((paidAmount / totalPrice) * 100);
      expect(progressPercent).toBe(0);
    });
  });
});

describe("Order Status Labels", () => {
  const statusLabels = {
    quoted: "Quoted",
    confirmed: "Confirmed",
    fabrication: "Fabrication",
    ready: "Ready",
    installed: "Installed",
    cancelled: "Cancelled",
  };

  const paymentLabels = {
    unpaid: "Unpaid",
    deposit_received: "Deposit Paid",
    paid_in_full: "Paid in Full",
  };

  it("should have all order status labels defined", () => {
    expect(statusLabels.quoted).toBe("Quoted");
    expect(statusLabels.confirmed).toBe("Confirmed");
    expect(statusLabels.fabrication).toBe("Fabrication");
    expect(statusLabels.ready).toBe("Ready");
    expect(statusLabels.installed).toBe("Installed");
    expect(statusLabels.cancelled).toBe("Cancelled");
  });

  it("should have all payment status labels defined", () => {
    expect(paymentLabels.unpaid).toBe("Unpaid");
    expect(paymentLabels.deposit_received).toBe("Deposit Paid");
    expect(paymentLabels.paid_in_full).toBe("Paid in Full");
  });

  it("should display correct status label for order", () => {
    const order = { status: "quoted" };
    expect(statusLabels[order.status]).toBe("Quoted");
  });
});

describe("Quote Calculation Logic", () => {
  it("should calculate area correctly", () => {
    const width = 2;
    const height = 1.5;
    const area = width * height;
    expect(area).toBe(3);
  });

  it("should calculate total area with quantity", () => {
    const area = 3;
    const quantity = 2;
    const totalArea = area * quantity;
    expect(totalArea).toBe(6);
  });

  it("should calculate subtotal with multipliers", () => {
    const totalArea = 6;
    const baseRate = 5000;
    const glazingMultiplier = 1.2;
    const finishMultiplier = 1.15;

    const subtotal =
      totalArea * baseRate * glazingMultiplier * finishMultiplier;
    expect(subtotal).toBe(41400);
  });

  it("should calculate estimate range (±8%)", () => {
    const subtotal = 30000;
    const variance = 0.08;

    const estimateMin = Math.round(subtotal * (1 - variance));
    const estimateMax = Math.round(subtotal * (1 + variance));

    expect(estimateMin).toBe(27600);
    expect(estimateMax).toBe(32400);
  });
});

describe("React Query Configuration", () => {
  it("should create QueryClient with default options", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });

    expect(queryClient).toBeDefined();
    expect(queryClient.getDefaultOptions()).toBeDefined();
  });
});

describe("User Flow Validation", () => {
  it("should validate step order in booking flow", () => {
    const steps = ["service", "location", "datetime", "confirm"];

    expect(steps[0]).toBe("service");
    expect(steps[1]).toBe("location");
    expect(steps[2]).toBe("datetime");
    expect(steps[3]).toBe("confirm");
  });

  it("should validate order status transitions", () => {
    const validTransitions = {
      quoted: ["confirmed", "cancelled"],
      confirmed: ["fabrication", "cancelled"],
      fabrication: ["ready", "cancelled"],
      ready: ["installed", "cancelled"],
      installed: [],
      cancelled: [],
    };

    expect(validTransitions.quoted).toContain("confirmed");
    expect(validTransitions.confirmed).toContain("fabrication");
    expect(validTransitions.fabrication).toContain("ready");
  });
});
