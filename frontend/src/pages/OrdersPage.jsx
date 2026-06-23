import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "../services/api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const ORDER_STATUSES = [
  "quoted",
  "confirmed",
  "fabrication",
  "ready",
  "installed",
  "cancelled",
];

const statusLabels = {
  quoted: "Quoted",
  confirmed: "Confirmed",
  fabrication: "Fabrication",
  ready: "Ready",
  installed: "Installed",
  cancelled: "Cancelled",
};

const paymentLabels = {
  unpaid: "Unpaid",
  deposit_received: "Deposit Paid",
  paid_in_full: "Paid in Full",
};

// Reserved for future status icon implementation
// eslint-disable-next-line no-unused-vars
const statusIcons = {
  quoted:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  confirmed: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  fabrication:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  ready: "M5 13l4 4L19 7",
  installed:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  cancelled:
    "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
};

function formatKes(amount) {
  return `KES ${parseFloat(amount).toLocaleString()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", user?.id, activeFilter],
    queryFn: () =>
      orderApi.list(activeFilter !== "all" ? { status: activeFilter } : {}),
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
        <svg
          className="w-12 h-12 mx-auto text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-red-400 mb-2">Failed to load orders</p>
        <p className="text-sm text-silver-500">Please try again later</p>
      </div>
    );
  }

  const orders = data?.data?.data || [];
  const totalOrders = data?.data?.pagination?.total || 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">
            My Orders
          </h2>
          <p className="text-silver-400">Track your fabrication projects</p>
        </div>
        <div className="text-sm text-silver-500">
          {totalOrders} order{totalOrders !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "all"
              ? "bg-cobalt text-white"
              : "bg-charcoal-700 text-silver-400 hover:text-warmwhite hover:bg-charcoal-600"
          }`}
        >
          All
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === status
                ? "bg-cobalt text-white"
                : "bg-charcoal-700 text-silver-400 hover:text-warmwhite hover:bg-charcoal-600"
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="card text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-silver-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-silver-400 mb-2">
            {activeFilter !== "all"
              ? `No ${statusLabels[activeFilter]?.toLowerCase()} orders`
              : "No orders yet"}
          </p>
          <p className="text-sm text-silver-500 mb-6">
            {activeFilter !== "all"
              ? "Try a different filter or check back later"
              : "Orders will appear here after your site visit and quotation"}
          </p>
          {activeFilter === "all" && (
            <Link to="/bookings" className="btn-primary inline-block">
              Book a Site Visit
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const remaining =
              parseFloat(order.total_price_kes) -
              parseFloat(order.paid_amount_kes);
            const progressPercent =
              order.total_price_kes > 0
                ? Math.round(
                    (parseFloat(order.paid_amount_kes) /
                      parseFloat(order.total_price_kes)) *
                      100,
                  )
                : 0;

            return (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="card block hover:border-cobalt/50 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left: order info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-warmwhite font-medium group-hover:text-cobalt-300 transition-colors">
                        {order.reference_number}
                      </span>
                      <span className={`badge badge-${order.status}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                      <span className={`badge badge-${order.payment_status}`}>
                        {paymentLabels[order.payment_status] ||
                          order.payment_status}
                      </span>
                    </div>
                    <p className="text-sm text-silver-300 mb-1 truncate">
                      {order.product_summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-silver-500">
                      <span>{formatKes(order.total_price_kes)}</span>
                      {order.scheduled_installation_at && (
                        <span>
                          Install: {formatDate(order.scheduled_installation_at)}
                        </span>
                      )}
                      <span>Created {formatDate(order.created_at)}</span>
                    </div>
                  </div>

                  {/* Right: payment progress */}
                  <div className="sm:text-right flex-shrink-0">
                    <div className="text-sm text-silver-400 mb-1">
                      {formatKes(order.paid_amount_kes)} paid
                    </div>
                    {remaining > 0 && (
                      <div className="text-sm text-silver-500 mb-2">
                        {formatKes(remaining)} remaining
                      </div>
                    )}
                    <div className="w-32 h-2 bg-charcoal-600 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          progressPercent >= 100
                            ? "bg-green-500"
                            : progressPercent > 0
                              ? "bg-cobalt"
                              : "bg-charcoal-600"
                        }`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
