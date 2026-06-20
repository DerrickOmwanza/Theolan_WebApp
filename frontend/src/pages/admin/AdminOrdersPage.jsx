import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { orderApi } from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

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

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState("all");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders", activeStatus],
    queryFn: () =>
      orderApi.listAll
        ? orderApi.listAll(
            activeStatus !== "all" ? { status: activeStatus } : {},
          )
        : null,
    enabled: !!user && user.role === "admin",
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      orderApi.adminUpdate(orderId, { status }),
    onSuccess: () => {
      setUpdatingOrderId(null);
      refetch();
    },
    onError: (err) => {
      setUpdatingOrderId(null);
      alert(err.response?.data?.error?.message || "Failed to update status");
    },
  });

  const orders = data?.data?.data || [];

  const handleStatusChange = (orderId, newStatus) => {
    if (confirm(`Change order status to ${statusLabels[newStatus]}?`)) {
      setUpdatingOrderId(orderId);
      updateStatusMutation.mutate({ orderId, status: newStatus });
    }
  };

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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">
            Orders Management
          </h2>
          <p className="text-silver-400">View and update all client orders</p>
        </div>
        <div className="text-sm text-silver-500">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Status filter tabs */}
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
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeStatus === status
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
          <p className="text-silver-400">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-warmwhite font-medium">
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
                    <span>Paid: {formatKes(order.paid_amount_kes)}</span>
                    <span>Created: {formatDate(order.created_at)}</span>
                  </div>
                </div>

                {/* Status actions */}
                <div className="flex-shrink-0">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    disabled={updatingOrderId === order.id}
                    className="input-field py-1 px-2 text-sm"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
