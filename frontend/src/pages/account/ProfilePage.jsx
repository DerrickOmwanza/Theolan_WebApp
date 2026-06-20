import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { profileSchema } from '../../utils/validation.js';

export default function ProfilePage() {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data) => {
    // TODO: Implement profile update API endpoint in backend (Week 5+)
    toast.success('Profile updated successfully');
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">Profile</h2>
      <p className="text-silver-400 mb-8">Manage your personal information</p>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="name" className="input-label">Full Name</label>
            <input id="name" type="text" className="input-field" {...register('name')} />
            {errors.name && <p className="input-error">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="input-label">Phone Number</label>
            <input
              id="phone"
              type="tel"
              className="input-field opacity-60 cursor-not-allowed"
              value={user?.phone || ''}
              disabled
            />
            <p className="text-xs text-silver-500 mt-1">Phone number cannot be changed</p>
          </div>

          <div>
            <label htmlFor="email" className="input-label">Email Address</label>
            <input id="email" type="email" className="input-field" placeholder="Optional" {...register('email')} />
            {errors.email && <p className="input-error">{errors.email.message}</p>}
          </div>

          {isDirty && (
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
