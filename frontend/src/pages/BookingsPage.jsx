import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "../services/api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import toast from "react-hot-toast";

const statusColors = {
  scheduled: "badge-scheduled",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
  no_show: "badge-cancelled",
};

export default function BookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: () => bookingApi.list(),
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id }) => bookingApi.update(id, { status: "cancelled" }),
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setShowConfirmDialog(null);
      setCancelError(null);
    },
    onError: (error) => {
      const message = error.response?.data?.error === "VALIDATION_ERROR"
        ? error.response?.data?.message || "Unable to cancel booking"
        : "Failed to cancel booking. Please try again.";
      toast.error(message);
      setCancelError(message);
    },
  });

  const handleCancel = (booking) => {
    setShowConfirmDialog(booking.id);
  };

  const confirmCancel = (booking) => {
    cancelMutation.mutate({ id: booking.id });
  };

  const cancelScheduledBooking = (booking) => {
    if (booking.status !== 'scheduled') return;
    handleCancel(booking);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    console.error("Failed to load bookings:", error);
    return (
      <div className="card text-center py-12">
        <p className="text-red-400">
          Failed to load bookings. Please try again.
        </p>
        {error.response?.status === 401 && (
          <p className="text-sm text-silver-500 mt-2">
            Authentication required. Please log in again.
          </p>
        )}
      </div>
    );
  }

  const bookings = data?.data?.data || [];

  return (
    <div>
      <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">
        My Bookings
      </h2>
      <p className="text-silver-400 mb-8">Your site visit appointments</p>

      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-silver-400 mb-4">
            You haven&apos;t booked any site visits yet.
          </p>
          <a href="/booking" className="btn-primary inline-block">
            Book a Visit
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const hoursRemaining = booking.scheduled_at
              ? (new Date(booking.scheduled_at) - Date.now()) / (1000 * 60 * 60)
              : 0;
            const canCancel = booking.status === "scheduled" && hoursRemaining >= 48 && !cancelError;

            return (
              <div
                key={booking.id}
                className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-warmwhite font-medium">
                      {booking.reference_number}
                    </span>
                    <span
                      className={`badge ${statusColors[booking.status] || ""}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-silver-400 capitalize">
                    {booking.service_type}
                  </p>
                  <p className="text-sm text-silver-500">
                    {new Date(booking.scheduled_at).toLocaleDateString("en-KE", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {booking.assigned_technician && (
                    <div className="text-sm text-silver-400 hidden sm:block">
                      Technician:{" "}
                      <span className="text-warmwhite">
                        {booking.assigned_technician.name}
                      </span>
                    </div>
                  )}
                  
                  {booking.status === "scheduled" && canCancel && (
                    <button
                      onClick={() => handleCancel(booking)}
                      disabled={cancelMutation.isPending}
                      className="btn-ghost text-red-400 hover:text-red-300"
                    >
                      Cancel Booking
                    </button>
                  )}

                  {booking.status === "scheduled" && !canCancel && hoursRemaining < 48 && (
                    <span className="text-xs text-silver-500" title="Bookings can only be cancelled 48 hours in advance">
                      Cannot cancel
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowConfirmDialog(null)} />
          <div className="bg-charcoal-700 border border-charcoal-600 rounded-lg p-6 w-full max-w-md mx-auto">
            <h3 className="text-lg font-heading font-bold text-warmwhite mb-4">
              Cancel Booking
            </h3>
            <p className="text-silver-400 mb-6">
              Are you sure you want to cancel this booking? This action will restore the time slot and send a confirmation SMS to your phone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="btn-secondary"
              >
                Keep Booking
              </button>
              <button
                onClick={() => confirmCancel({ id: showConfirmDialog })}
                disabled={cancelMutation.isPending}
                className="btn-ghost bg-red-500 hover:bg-red-600 text-white"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error message for cancelled bookings */}
      {cancelError && (
        <div className="card text-center py-12">
          <p className="text-red-400 mb-4">{cancelError}</p>
          <p className="text-sm text-silver-400">
            If you need to cancel a booking within 48 hours, please contact us directly.
          </p>
        </div>
      )}
    </div>
  );
}