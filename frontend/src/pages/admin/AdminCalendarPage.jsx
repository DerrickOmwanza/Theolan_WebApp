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

export default function AdminCalendarPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [activeStatus, setActiveStatus] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", selectedDate, activeStatus],
    queryFn: () => {
      const start = selectedDate;
      const end = new Date(selectedDate);
      end.setDate(end.getDate() + 7);
      return bookingApi.adminList({
        start_date: start,
        end_date: end.toISOString().split("T")[0],
        status: activeStatus !== "all" ? activeStatus : undefined,
      });
    },
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">
            Calendar View
          </h2>
          <p className="text-silver-400">
            Manage bookings and technician schedules
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-silver-400">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field py-1"
          />
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveStatus("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeStatus === "all"
              ? "bg-cobalt text-white"
              : "bg-charcoal-700 text-silver-400 hover:text-warmwhite hover:bg-charcoal-600"
          }`}
        >
          All
        </button>
        {["scheduled", "completed", "cancelled", "no_show"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeStatus === status
                ? "bg-cobalt text-white"
                : "bg-charcoal-700 text-silver-400 hover:text-warmwhite hover:bg-charcoal-600"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-silver-400">No bookings for this period</p>
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
                      {booking.status}
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
                  </div>
                </div>
                {booking.client && (
                  <div className="lg:text-right flex-shrink-0">
                    <p className="text-sm text-warmwhite">
                      {booking.client.name}
                    </p>
                    <p className="text-sm text-silver-500">
                      {booking.client.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
