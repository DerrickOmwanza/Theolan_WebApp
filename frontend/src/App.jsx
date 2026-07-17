import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Layouts
import PublicLayout from "./layouts/PublicLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import ClientLayout from "./layouts/ClientLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage.jsx";
import SignupPage from "./pages/auth/SignupPage.jsx";
import OtpPage from "./pages/auth/OtpPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";

// Account Pages
import ProfilePage from "./pages/account/ProfilePage.jsx";
import SecurityPage from "./pages/account/SecurityPage.jsx";

// Public Pages
import HomePage from "./pages/HomePage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import QuotePage from "./pages/QuotePage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage.jsx";
import TermsOfServicePage from "./pages/TermsOfServicePage.jsx";

// Client Pages
import OrdersPage from "./pages/OrdersPage.jsx";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";

// Admin Pages
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import AdminCalendarPage from "./pages/admin/AdminCalendarPage.jsx";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage.jsx";
import AnalyticsPage from "./pages/admin/AnalyticsPage.jsx";
import SettingsPage from "./pages/admin/SettingsPage.jsx";
import AdminGalleryPage from "./pages/admin/AdminGalleryPage.jsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";

// Error Pages
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ForbiddenPage from "./pages/ForbiddenPage.jsx";

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-charcoal-800">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-cobalt/30 border-t-cobalt" />
      </div>
    );
  }

  return (
    <Routes>
      {/* ============================== */}
      {/* PUBLIC ROUTES                  */}
      {/* ============================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      </Route>

      {/* ============================== */}
      {/* AUTH ROUTES                    */}
      {/* ============================== */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/verify-otp" element={<OtpPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* ============================== */}
      {/* PROTECTED CLIENT ROUTES        */}
      {/* ============================== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/account/profile" element={<ProfilePage />} />
        <Route path="/account/security" element={<SecurityPage />} />
      </Route>

      {/* ============================== */}
      {/* PROTECTED ADMIN ROUTES         */}
      {/* ============================== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={<Navigate to="/admin/analytics" replace />}
        />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/calendar" element={<AdminCalendarPage />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/gallery" element={<AdminGalleryPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
      </Route>

      {/* ============================== */}
      {/* ERROR PAGES                    */}
      {/* ============================== */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* ============================== */}
      {/* FALLBACK                       */}
      {/* ============================== */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
