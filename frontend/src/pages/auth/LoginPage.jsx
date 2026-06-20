import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { loginSchema } from '../../utils/validation.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/orders';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.phone, data.password);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-heading font-bold text-warmwhite mb-2">Welcome Back</h2>
      <p className="text-sm text-silver-400 mb-8">Log in to your Theolan account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="phone" className="input-label">Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="+254712345678"
            className="input-field"
            {...register('phone')}
          />
          {errors.phone && <p className="input-error">{errors.phone.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="input-label !mb-0">Password</label>
            <Link to="/auth/forgot-password" className="text-xs text-cobalt-400 hover:text-cobalt-300">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="input-field"
            {...register('password')}
          />
          {errors.password && <p className="input-error">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <LoadingSpinner size="sm" className="text-white" /> : 'Log In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-silver-400">
        Don't have an account?{' '}
        <Link to="/auth/signup" className="text-cobalt-400 hover:text-cobalt-300 font-medium">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
