import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { forgotPasswordSchema } from '../../utils/validation.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await forgotPassword(data.phone);
      toast.success('Reset code sent to your phone');
      navigate('/auth/reset-password', { state: { phone: data.phone } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-heading font-bold text-warmwhite mb-2">Reset Password</h2>
      <p className="text-sm text-silver-400 mb-8">Enter your phone number and we&apos;ll send you a reset code</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="phone" className="input-label">Phone Number</label>
          <input id="phone" type="tel" placeholder="+254712345678" className="input-field" {...register('phone')} />
          {errors.phone && <p className="input-error">{errors.phone.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <LoadingSpinner size="sm" className="text-white" /> : 'Send Reset Code'}
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
