import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { resetPasswordSchema } from '../../utils/validation.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const phone = location.state?.phone || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { phone, code: '', new_password: '', confirm_password: '' },
  });

  useEffect(() => {
    setValue('phone', phone);
  }, [phone, setValue]);

  // OTP input refs
  const otpRefs = useRef([]);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);
    setValue('code', newOtp.join(''));
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const onSubmit = async (data) => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(data.phone, code, data.new_password);
      toast.success('Password reset successfully! Please log in.');
      navigate('/auth/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-heading font-bold text-warmwhite mb-2">Set New Password</h2>
      <p className="text-sm text-silver-400 mb-8">
        Enter the 6-digit code sent to <span className="text-warmwhite">{phone}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register('phone')} />

        {/* OTP Input */}
        <div>
          <label className="input-label">Verification Code</label>
          <div className="flex gap-2 justify-center">
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                className="w-12 h-14 text-center text-xl font-mono bg-charcoal-700 border border-silver-600 rounded-md text-warmwhite focus:border-cobalt focus:ring-1 focus:ring-cobalt"
              />
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="new_password" className="input-label">New Password</label>
          <input id="new_password" type="password" placeholder="Min 8 chars, uppercase, lowercase, digit" className="input-field" {...register('new_password')} />
          {errors.new_password && <p className="input-error">{errors.new_password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirm_password" className="input-label">Confirm New Password</label>
          <input id="confirm_password" type="password" placeholder="Re-enter your new password" className="input-field" {...register('confirm_password')} />
          {errors.confirm_password && <p className="input-error">{errors.confirm_password.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <LoadingSpinner size="sm" className="text-white" /> : 'Reset Password'}
        </button>
      </form>

      <p className="mt-6 text-center">
        <Link to="/auth/login" className="text-sm text-silver-400 hover:text-warmwhite">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
