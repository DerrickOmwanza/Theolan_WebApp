import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../contexts/AuthContext.jsx";

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
  getAccessToken: vi.fn(() => null),
  getRefreshToken: vi.fn(() => null),
  getStoredUser: vi.fn(() => null),
  setTokens: vi.fn(),
  setUser: vi.fn(),
  clearAuth: vi.fn(),
  orderApi: { list: vi.fn() },
  bookingApi: { list: vi.fn() },
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="authenticated">
        {isAuthenticated ? "authenticated" : "not-authenticated"}
      </span>
      {user && <span data-testid="username">{user.name}</span>}
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide auth context with default values", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent(
      "not-authenticated",
    );
  });

  it("should update loading state during initialization", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });
  });
});
