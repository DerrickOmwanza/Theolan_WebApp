import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { authApi } from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

export default function OtpPage() {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputsRef = useRef([]);

  // Get phone from location state only (no sessionStorage fallback)
  // This prevents race conditions
  const phone =
    location.state && location.state.phone ? location.state.phone : "";

  // Countdown timer effect for resend cooldown
  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const otpCode = code.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtp(phone, otpCode);
      toast.success("Phone verified! You can now log in.");
      navigate("/auth/login", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired code";
      toast.error(msg);
      setCode(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (countdown > 0 || resending || !phone) return;

    setResending(true);
    try {
      const response = await authApi.resendOTP({ phone });
      toast.success(response.data.message || "New verification code sent!");
      setCountdown(60);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend code";
      toast.error(msg);
    } finally {
      setResending(false);
    }
  }, [countdown, resending, phone]);

  // Render nothing if we don't have a phone from location state
  // This prevents the page from showing without proper context
  if (!phone) {
    return (
      <div className="card">
        <h2 className="text-2xl font-heading font-bold text-warmwhite mb-2">
          Phone Number Required
        </h2>
        <p className="text-sm text-silver-400 mb-6">
          No phone number provided. Please{" "}
        </p>
        <div className="flex gap-4">
          <Link to="/auth/signup" className="btn-primary flex-1 text-center">
            Sign Up
          </Link>
          <Link to="/auth/login" className="btn-secondary flex-1 text-center">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-heading font-bold text-warmwhite mb-2">
        Verify Your Phone
      </h2>
      <p className="text-sm text-silver-400 mb-8">
        We sent a 6-digit code to{" "}
        <span className="text-warmwhite">{phone}</span>
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex gap-2 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              autoComplete="one-time-code"
              className="w-12 h-14 text-center text-xl font-mono bg-charcoal-700 border border-silver-600 rounded-md text-warmwhite focus:border-cobalt focus:ring-1 focus:ring-cobalt"
              name={`otp-digit-${index}`}
              aria-label={`Digit ${index + 1} of OTP code`}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? (
            <LoadingSpinner size="sm" className="text-white" />
          ) : (
            "Verify Code"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-silver-400">
        Didn&apos;t receive the code?{" "}
        <button
          onClick={handleResend}
          disabled={countdown > 0 || resending || !phone}
          className={`text-cobalt-400 hover:text-cobalt-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        >
          {countdown > 0 ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="xs" className="mr-1" />
              Resend in {countdown}s
            </span>
          ) : resending ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="xs" className="mr-1" />
              Sending...
            </span>
          ) : (
            "Resend Code"
          )}
        </button>
      </p>

      <p className="mt-4 text-center">
        <Link
          to="/auth/login"
          className="text-sm text-silver-500 hover:text-warmwhite"
        >
          Back to Login
        </Link>
      </p>
    </div>
  );
}
