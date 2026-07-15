import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { changePasswordSchema } from "../../utils/validation.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { profileApi } from "../../services/api.js";

export default function SecurityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await profileApi.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      toast.success("Password changed successfully. Please log in again.");
      reset();
      // Force logout - refresh tokens are revoked server-side
      navigate("/auth/login", { replace: true });
    } catch (err) {
      const message = err.response?.data?.error?.message ||
                      err.response?.data?.message ||
                      "Failed to change password";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">
        Security
      </h2>
      <p className="text-silver-400 mb-8">Manage your account security</p>

      {/* Phone Verification Status */}
      <div className="card mb-6">
        <h3 className="text-lg font-heading font-semibold text-warmwhite mb-3">
          Phone Verification
        </h3>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${user?.phone_verified ? "bg-green-500" : "bg-yellow-500"}`}
          />
          <span className="text-sm text-silver-300">
            {user?.phone_verified
              ? "Phone number verified"
              : "Phone number not verified"}
          </span>
        </div>
        <p className="text-sm text-silver-500 mt-2">{user?.phone}</p>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="text-lg font-heading font-semibold text-warmwhite mb-4">
          Change Password
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="current_password" className="input-label">
              Current Password
            </label>
            <input
              id="current_password"
              type="password"
              className="input-field"
              {...register("current_password")}
            />
            {errors.current_password && (
              <p className="input-error">{errors.current_password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="new_password" className="input-label">
              New Password
            </label>
            <input
              id="new_password"
              type="password"
              placeholder="Min 8 chars, uppercase, lowercase, digit"
              className="input-field"
              {...register("new_password")}
            />
            {errors.new_password && (
              <p className="input-error">{errors.new_password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirm_password" className="input-label">
              Confirm New Password
            </label>
            <input
              id="confirm_password"
              type="password"
              className="input-field"
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="input-error">{errors.confirm_password.message}</p>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
