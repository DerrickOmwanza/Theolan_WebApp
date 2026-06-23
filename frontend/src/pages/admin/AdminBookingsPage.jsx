import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "../../services/api.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusLabels = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const [activeStatus, setActiveStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", activeStatus, page],
    queryFn: () =>
      bookingApi.adminList({
        status: activeStatus !== "all" ? activeStatus : undefined,
        limit,
        offset: (page - 1) * limit,
      }),
    enabled: !!user && user.role === "admin",
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="card text-center py-12">
        <p className="text-silver-400">Admin access required</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const bookings = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">
            All Bookings
          </h2>
          <p className="text-silver-400">
            Manage all client bookings and site visits
          </p>
        </div>
        <div className="text-sm text-silver-500">
          {total} booking{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => {
            setActiveStatus("all");
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeStatus === "all"
              ? "bg-cobalt text-white"
              : "bg-charcoal-700 text-silver-400 hover:text-warmwhite hover:bg-charcoal-600"
          }`}
        >
          All
        </button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setActiveStatus(key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeStatus === key
                ? "bg-cobalt text-white"
                : "bg-charcoal-700 text-silver-400 hover:text-warmwhite hover:bg-charcoal-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-silver-400">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-warmwhite font-medium">
                      {booking.reference_number}
                    </span>
                    <span className={`badge badge-${booking.status}`}>
                      {statusLabels[booking.status] || booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-silver-300 mb-1 capitalize">
                    {booking.service_type?.replace("_", " ")}
                  </p>
                  <p className="text-sm text-silver-500 mb-1 truncate">
                    {booking.location}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-silver-500">
                    <span>{formatDate(booking.scheduled_at)}</span>
                    <span>{formatTime(booking.scheduled_at)}</span>
                    {booking.technician_name && (
                      <span>Tech: {booking.technician_name}</span>
                    )}
                  </div>
                </div>
                <div className="lg:text-right flex-shrink-0">
                  {booking.client_name && (
                    <>
                      <p className="text-sm text-warmwhite">
                        {booking.client_name}
                      </p>
                      {booking.client_phone && (
                        <p className="text-sm text-silver-500">
                          {booking.client_phone}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-silver-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
