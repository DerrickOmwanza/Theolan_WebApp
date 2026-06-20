import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const statusColors = {
  scheduled: 'badge-scheduled',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
  no_show: 'badge-cancelled',
};

export default function BookingsPage() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: () => bookingApi.list(),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-400">Failed to load bookings. Please try again.</p>
      </div>
    );
  }

  const bookings = data?.data?.data || [];

  return (
    <div>
      <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">My Bookings</h2>
      <p className="text-silver-400 mb-8">Your site visit appointments</p>

      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-silver-400 mb-4">You haven&apos;t booked any site visits yet.</p>
          <a href="/booking" className="btn-primary inline-block">Book a Visit</a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-warmwhite font-medium">{booking.reference_number}</span>
                  <span className={`badge ${statusColors[booking.status] || ''}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-silver-400 capitalize">{booking.service_type}</p>
                <p className="text-sm text-silver-500">
                  {new Date(booking.scheduled_at).toLocaleDateString('en-KE', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              {booking.assigned_technician && (
                <div className="text-sm text-silver-400">
                  Technician: <span className="text-warmwhite">{booking.assigned_technician.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
