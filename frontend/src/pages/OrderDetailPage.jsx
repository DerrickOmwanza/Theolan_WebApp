import { useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi, paymentApi } from "../services/api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

// ============================================================
// Constants
// ============================================================

const STATUS_STEPS = [
  "quoted",
  "confirmed",
  "fabrication",
  "ready",
  "installed",
];

const statusLabels = {
  quoted: "Quoted",
  confirmed: "Confirmed",
  fabrication: "Fabrication",
  ready: "Ready for Install",
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

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================
// Status Stepper Component
// Visualizes the order state machine pipeline
// ============================================================

function StatusStepper({ currentStatus, isCancelled }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div>
          <p className="text-red-400 font-medium text-sm">Order Cancelled</p>
          <p className="text-silver-500 text-xs">
            This order has been cancelled
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {STATUS_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        // eslint-disable-next-line no-unused-vars
        const _isPending = index > currentIndex;

        return (
          <div key={step} className="flex-1 flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                      ? "bg-cobalt text-white ring-4 ring-cobalt/20"
                      : "bg-charcoal-600 text-silver-500"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-xs whitespace-nowrap ${
                  isCompleted
                    ? "text-green-400"
                    : isCurrent
                      ? "text-cobalt-300 font-medium"
                      : "text-silver-500"
                }`}
              >
                {statusLabels[step]}
              </span>
            </div>

            {/* Connector line */}
            {index < STATUS_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentIndex ? "bg-green-500" : "bg-charcoal-600"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Timeline Component
// Shows order events chronologically
// ============================================================

function OrderTimeline({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="space-y-0">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline line + dot */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                event.is_current
                  ? "bg-cobalt ring-4 ring-cobalt/20"
                  : "bg-charcoal-500"
              }`}
            />
            {index < events.length - 1 && (
              <div className="w-0.5 flex-1 bg-charcoal-600 min-h-[24px]" />
            )}
          </div>

          {/* Event content */}
          <div className={`pb-6 ${index === events.length - 1 ? "pb-0" : ""}`}>
            <p
              className={`text-sm font-medium ${event.is_current ? "text-cobalt-300" : "text-silver-300"}`}
            >
              {event.title}
            </p>
            {event.description && (
              <p className="text-xs text-silver-500 mt-0.5">
                {event.description}
              </p>
            )}
            <p className="text-xs text-silver-600 mt-1">
              {formatDateTime(event.occurred_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Payment Modal Component
// M-Pesa STK Push trigger with polling
// ============================================================

function PaymentModal({ order, onClose, onSuccess }) {
  const { user } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const queryClient = useQueryClient();
  const [step, setStep] = useState("form"); // form | processing | success | failed
  const [phone, setPhone] = useState(user?.phone || "");
  const [amount, setAmount] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [error, setError] = useState("");

  const remaining =
    parseFloat(order.total_price_kes) - parseFloat(order.paid_amount_kes);

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");

    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (payAmount > remaining) {
      setError(`Amount cannot exceed ${formatKes(remaining)}`);
      return;
    }

    // Normalize phone: ensure it starts with +254
    let normalizedPhone = phone.replace(/\s/g, "");
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "+254" + normalizedPhone.slice(1);
    } else if (
      normalizedPhone.startsWith("7") ||
      normalizedPhone.startsWith("1")
    ) {
      normalizedPhone = "+254" + normalizedPhone;
    }

    setStep("processing");

    try {
      const response = await paymentApi.initiateSTK({
        order_id: order.id,
        amount_kes: payAmount,
        phone_number: normalizedPhone,
      });

      const requestId = response.data.data.checkout_request_id;
      setCheckoutRequestId(requestId);

      // Poll for payment status every 3 seconds, up to ~90 seconds
      let attempts = 0;
      const maxAttempts = 30;
      const poll = async () => {
        try {
          const statusRes = await paymentApi.getPaymentStatus(requestId);
          const status = statusRes.data.data.status;

          if (status === "success") {
            setStep("success");
            onSuccess();
            return;
          }
          if (status === "failed") {
            setStep("failed");
            setError("Payment was not successful. Please try again.");
            return;
          }

          // Still pending — poll again
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 3000);
          } else {
            setStep("failed");
            setError(
              "Payment verification timed out. Check your M-Pesa messages and refresh the page.",
            );
          }
        } catch {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 3000);
          } else {
            setStep("failed");
            setError("Could not verify payment. Check your M-Pesa messages.");
          }
        }
      };

      setTimeout(poll, 4000);
    } catch (err) {
      setStep("failed");
      setError(
        err.response?.data?.message ||
          "Payment initiation failed. Please try again.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-charcoal-700 border border-charcoal-600 rounded-lg p-6 w-full max-w-md shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-silver-400 hover:text-warmwhite"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {step === "form" && (
          <>
            <h3 className="text-lg font-heading font-bold text-warmwhite mb-1">
              Pay for Order
            </h3>
            <p className="text-sm text-silver-400 mb-6">
              {order.reference_number} — {formatKes(remaining)} remaining
            </p>

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="input-label">Amount (KES)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Min 1 — Max ${formatKes(remaining)}`}
                  className="input-field"
                  min="1"
                  max={remaining}
                  required
                />
              </div>

              <div>
                <label className="input-label">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712 345 678"
                  className="input-field"
                  required
                />
              </div>

              {error && <p className="input-error">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Pay with M-Pesa
                </button>
              </div>
            </form>
          </>
        )}

        {step === "processing" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-bold text-warmwhite mb-2">
              Check Your Phone
            </h3>
            <p className="text-sm text-silver-400 mb-6">
              An M-Pesa prompt has been sent to your phone. Enter your PIN to
              complete payment.
            </p>
            <div className="flex justify-center">
              <LoadingSpinner size="md" />
            </div>
            <p className="text-xs text-silver-500 mt-4">
              Waiting for payment confirmation...
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-bold text-warmwhite mb-2">
              Payment Successful!
            </h3>
            <p className="text-sm text-silver-400 mb-6">
              Your payment has been confirmed. You will receive an SMS shortly.
            </p>
            <button onClick={onClose} className="btn-primary">
              Done
            </button>
          </div>
        )}

        {step === "failed" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-heading font-bold text-warmwhite mb-2">
              Payment Failed
            </h3>
            <p className="text-sm text-silver-400 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={onClose} className="btn-ghost">
                Close
              </button>
              <button
                onClick={() => {
                  setStep("form");
                  setError("");
                }}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// OrderDetailPage
// Main page component
// ============================================================

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPayment, setShowPayment] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getById(id),
    enabled: !!id,
  });

  const order = data?.data?.data;
  const isCancelled = order?.status === "cancelled";
  const remaining = order
    ? parseFloat(order.total_price_kes) - parseFloat(order.paid_amount_kes)
    : 0;
  const canPay =
    order && !isCancelled && remaining > 0 && order.status !== "installed";

  const handlePaymentSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["order", id] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  }, [queryClient, id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
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
        <p className="text-red-400 mb-2">Order not found</p>
        <Link to="/orders" className="btn-ghost mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back navigation */}
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-2 text-silver-400 hover:text-warmwhite mb-6 text-sm transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Orders
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-heading font-bold text-warmwhite">
              {order.reference_number}
            </h2>
            <span className={`badge badge-${order.status}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <p className="text-silver-400">{order.product_summary}</p>
        </div>

        {canPay && (
          <button
            onClick={() => setShowPayment(true)}
            className="btn-primary flex-shrink-0"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Pay{" "}
            {remaining === parseFloat(order.total_price_kes)
              ? "Deposit"
              : "Balance"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: status stepper + timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Stepper */}
          <div className="card">
            <h3 className="text-sm font-medium text-silver-300 mb-4">
              Order Progress
            </h3>
            <StatusStepper
              currentStatus={order.status}
              isCancelled={isCancelled}
            />
          </div>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium text-silver-300 mb-4">
                Timeline
              </h3>
              <OrderTimeline events={order.timeline} />
            </div>
          )}

          {/* Dimensions / Notes */}
          {order.dimensions_notes && (
            <div className="card">
              <h3 className="text-sm font-medium text-silver-300 mb-2">
                Dimensions & Notes
              </h3>
              <p className="text-sm text-silver-400 whitespace-pre-wrap">
                {order.dimensions_notes}
              </p>
            </div>
          )}
        </div>

        {/* Right column: order summary */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="card">
            <h3 className="text-sm font-medium text-silver-300 mb-4">
              Payment Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-silver-400">Total Price</span>
                <span className="text-warmwhite font-medium">
                  {formatKes(order.total_price_kes)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-silver-400">Paid</span>
                <span className="text-green-400">
                  {formatKes(order.paid_amount_kes)}
                </span>
              </div>
              <div className="border-t border-charcoal-600 pt-3 flex justify-between text-sm">
                <span className="text-silver-400">Remaining</span>
                <span
                  className={`font-medium ${remaining > 0 ? "text-amber-400" : "text-green-400"}`}
                >
                  {formatKes(remaining)}
                </span>
              </div>
            </div>

            {/* Payment progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-silver-500 mb-1">
                <span>Payment Progress</span>
                <span>
                  {order.total_price_kes > 0
                    ? Math.round(
                        (parseFloat(order.paid_amount_kes) /
                          parseFloat(order.total_price_kes)) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 bg-charcoal-600 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    remaining === 0 ? "bg-green-500" : "bg-cobalt"
                  }`}
                  style={{
                    width: `${Math.min(
                      order.total_price_kes > 0
                        ? (parseFloat(order.paid_amount_kes) /
                            parseFloat(order.total_price_kes)) *
                            100
                        : 0,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className={`badge badge-${order.payment_status}`}>
                {paymentLabels[order.payment_status] || order.payment_status}
              </span>
            </div>
          </div>

          {/* Order Details */}
          <div className="card">
            <h3 className="text-sm font-medium text-silver-300 mb-4">
              Order Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-silver-400">Reference</span>
                <span className="text-warmwhite">{order.reference_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Created</span>
                <span className="text-silver-300">
                  {formatDate(order.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-silver-400">Last Updated</span>
                <span className="text-silver-300">
                  {formatDate(order.updated_at)}
                </span>
              </div>
              {order.scheduled_installation_at && (
                <div className="flex justify-between">
                  <span className="text-silver-400">Installation</span>
                  <span className="text-cobalt-300">
                    {formatDate(order.scheduled_installation_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          order={order}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
