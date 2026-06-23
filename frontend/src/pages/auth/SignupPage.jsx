import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { signupSchema } from '../../utils/validation.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import CountryPhoneInput from '../../components/CountryPhoneInput.jsx';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      accept_sms_consent: false,
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await signup({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        password: data.password,
        accept_sms_consent: data.accept_sms_consent,
      });
      toast.success('Account created! Check your phone for the verification code.');
      navigate('/auth/verify-otp', { state: { phone: data.phone } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-heading font-bold text-warmwhite mb-2">Create Account</h2>
      <p className="text-sm text-silver-400 mb-8">Join Theolan Aluminium for booking, quotes, and order tracking</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="name" className="input-label">Full Name</label>
          <input id="name" type="text" placeholder="John Doe" className="input-field" {...register('name')} />
          {errors.name && <p className="input-error">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="input-label">Phone Number</label>
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
          <label htmlFor="email" className="input-label">Email (optional)</label>
          <input id="email" type="email" placeholder="john@example.com" className="input-field" {...register('email')} />
          {errors.email && <p className="input-error">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="input-label">Password</label>
          <input id="password" type="password" placeholder="Min 8 chars, uppercase, lowercase, digit" className="input-field" {...register('password')} />
          {errors.password && <p className="input-error">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
          <input id="confirmPassword" type="password" placeholder="Re-enter your password" className="input-field" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="input-error">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-start gap-3">
          <input
            id="accept_sms_consent"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-silver-600 bg-charcoal-700 text-cobalt focus:ring-cobalt"
            {...register('accept_sms_consent')}
          />
          <label htmlFor="accept_sms_consent" className="text-xs text-silver-400">
            I agree to receive SMS notifications about my bookings and orders
          </label>
        </div>
        {errors.accept_sms_consent && <p className="input-error">{errors.accept_sms_consent.message}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? <LoadingSpinner size="sm" className="text-white" /> : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-silver-400">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-cobalt-400 hover:text-cobalt-300 font-medium">
          Log In
        </Link>
      </p>
    </div>
  );
}
