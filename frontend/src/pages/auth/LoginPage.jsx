import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { loginSchema } from "../../utils/validation.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import CountryPhoneInput from "../../components/CountryPhoneInput.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const onSubmit = async (data) => {
    console.log("Login submitted with:", data.phone);
    setSubmitting(true);
    try {
      const result = await login(data.phone, data.password);
      console.log("Login success:", result);
      toast.success("Welcome back!");

      // Role-based redirect: admins go to analytics, clients go to orders
      const userRole = result.data?.user?.role;
      const defaultRedirect = userRole === "admin" ? "/admin/analytics" : "/orders";
      const redirectTo = location.state?.from?.pathname || defaultRedirect;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Login catch error:", err);
      let msg = "Login failed. Please try again.";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-heading font-bold text-warmwhite mb-2">
        Welcome Back
      </h2>
      <p className="text-sm text-silver-400 mb-8">
        Log in to your Theolan account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="phone" className="input-label">
            Phone Number
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <CountryPhoneInput
                id="phone"
                value={field.value}
                onChange={field.onChange}
                error={errors.phone?.message}
                placeholder="712345678"
              />
            )}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="input-label !mb-0">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-cobalt-400 hover:text-cobalt-300"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="input-field"
            {...register("password")}
          />
          {errors.password && (
            <p className="input-error">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? (
            <LoadingSpinner size="sm" className="text-white" />
          ) : (
            "Log In"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-silver-400">
        Don&apos;t have an account?{" "}
        <Link
          to="/auth/signup"
          className="text-cobalt-400 hover:text-cobalt-300 font-medium"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
