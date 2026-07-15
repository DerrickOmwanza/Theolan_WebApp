import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as Sentry from "@sentry/react";
import {
  authApi,
  profileApi,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setTokens,
  setUser,
  clearAuth,
} from "../services/api.js";

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and provides authentication state + methods.
 */
export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check if we have valid tokens
  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getStoredUser();

    if (token && storedUser) {
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  const signup = useCallback(async (data) => {
    const response = await authApi.signup(data);
    return response.data;
  }, []);

  const verifyOtp = useCallback(async (phone, code) => {
    const response = await authApi.verifyOtp({ phone, code });
    return response.data;
  }, []);

  const login = useCallback(async (phone, password) => {
    const response = await authApi.login({ phone, password });
    const { access_token, refresh_token, user: userData } = response.data.data;

    setTokens(access_token, refresh_token);
    setUser(userData);
    setUserState(userData);

    // Set Sentry user context for error tracking
    if (import.meta.env.PROD) {
      Sentry.setUser({
        id: userData.id,
        phone: userData.phone,
        role: userData.role
      });
    }

    return response.data;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      await authApi.logout(refreshToken);
    } catch {
      // Proceed with local logout even if API call fails
    }
    clearAuth();
    setUserState(null);

    // Clear Sentry user context
    if (import.meta.env.PROD) {
      Sentry.setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (phone) => {
    const response = await authApi.forgotPassword({ phone });
    return response.data;
  }, []);

  const resetPassword = useCallback(async (phone, code, newPassword) => {
    const response = await authApi.resetPassword({
      phone,
      code,
      new_password: newPassword,
    });
    return response.data;
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const response = await profileApi.update(updates);
    const updatedUser = response.data?.data;

    if (updatedUser) {
      setUser(updatedUser);
      setUserState(updatedUser);

      // Update Sentry user context in production
      if (import.meta.env.PROD) {
        Sentry.setUser({
          id: updatedUser.id,
          phone: updatedUser.phone,
          role: updatedUser.role
        });
      }
    }

    return response.data;
  }, []);

  const isAuthenticated = !!user && !!getAccessToken();

  const value = {
    user,
    isLoading,
    isAuthenticated,
    signup,
    verifyOtp,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook — access auth state and methods from any component.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
