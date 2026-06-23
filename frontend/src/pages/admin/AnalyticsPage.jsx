import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../../services/api.js";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";

// ============================================================
// Chart Placeholder Component
// ============================================================

function ChartPlaceholder({ title, value, subtitle, color = "cobalt" }) {
  const colorClasses = {
    cobalt: "text-cobalt",
    green: "text-green-400",
    amber: "text-amber-400",
    silver: "text-silver-400",
  };

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-silver-500 mb-2">{title}</h3>
      <div className={`text-3xl font-bold ${colorClasses[color]} mb-1`}>
        {value}
      </div>
      {subtitle && <p className="text-sm text-silver-600">{subtitle}</p>}
    </div>
  );
}

// ============================================================
// Bar Chart Placeholder (for trends)
// ============================================================

function BarChart({ data, title }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-warmwhite mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-sm text-silver-500 w-20">{item.label}</span>
            <div className="flex-1 bg-charcoal-700 rounded-full h-6 overflow-hidden">
              <div
                className="h-full bg-cobalt transition-all"
                style={{
                  width: `${Math.round((item.value / maxValue) * 100)}%`,
                }}
              />
            </div>
            <span className="text-sm text-silver-400 w-16 text-right">
              {item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Analytics Dashboard Page
// ============================================================

export default function AnalyticsPage() {
  const { user } = useAuth();

  // Revenue analytics
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["analytics", "revenue"],
    queryFn: () => analyticsApi.getRevenue(),
    enabled: !!user && user.role === "admin",
  });

  // Booking analytics
  const { data: bookingData, isLoading: bookingLoading } = useQuery({
    queryKey: ["analytics", "bookings"],
    queryFn: () => analyticsApi.getBookings(),
    enabled: !!user && user.role === "admin",
  });

  // Order analytics
  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ["analytics", "orders"],
    queryFn: () => analyticsApi.getOrders(),
    enabled: !!user && user.role === "admin",
  });

  // Load dashboard (all analytics combined)
  const { data: dashboardData } = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => analyticsApi.getDashboard(),
    enabled: !!user && user.role === "admin",
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="card text-center py-12">
        <p className="text-silver-400">Admin access required</p>
      </div>
    );
  }

  if (revenueLoading || bookingLoading || orderLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const revenue = dashboardData?.data?.revenue || revenueData?.data || {};
  const bookings = dashboardData?.data?.bookings || bookingData?.data || {};
  const orders = dashboardData?.data?.orders || orderData?.data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">
          Analytics Dashboard
        </h2>
        <p className="text-silver-400">Business metrics and performance</p>
      </div>

      {/* Revenue Metrics */}
      <section>
        <h3 className="text-xl font-semibold text-warmwhite mb-4">Revenue</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ChartPlaceholder
            title="Total Revenue"
            value={`KES ${(revenue.total_revenue_kes || 0).toLocaleString()}`}
            color="green"
          />
          <ChartPlaceholder
            title="Paid in Full"
            value={revenue.payment_status_breakdown?.paid_in_full || 0}
            subtitle="Orders"
            color="cobalt"
          />
          <ChartPlaceholder
            title="Deposit Received"
            value={revenue.payment_status_breakdown?.deposit_received || 0}
            subtitle="Orders"
            color="amber"
          />
          <ChartPlaceholder
            title="Unpaid"
            value={revenue.payment_status_breakdown?.unpaid || 0}
            subtitle="Orders"
            color="silver"
          />
        </div>

        {/* Revenue by Product */}
        {revenue.revenue_by_product &&
          revenue.revenue_by_product.length > 0 && (
            <div className="mt-6">
              <BarChart
                title="Revenue by Product Category"
                data={revenue.revenue_by_product.map((p) => ({
                  label: p.category,
                  value: p.total_kes,
                }))}
              />
            </div>
          )}
      </section>

      {/* Booking Metrics */}
      <section>
        <h3 className="text-xl font-semibold text-warmwhite mb-4">Bookings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ChartPlaceholder
            title="Total Bookings"
            value={bookings.total_bookings || 0}
            color="cobalt"
          />
          <ChartPlaceholder
            title="Completion Rate"
            value={`${bookings.completion_rate_percent || 0}%`}
            color="green"
          />
          <ChartPlaceholder
            title="No-Show Rate"
            value={`${bookings.no_show_rate_percent || 0}%`}
            color="amber"
          />
          <ChartPlaceholder
            title="Busiest Day"
            value={bookings.busiest_days?.[0]?.date || "-"}
            subtitle={`${bookings.busiest_days?.[0]?.booking_count || 0} bookings`}
            color="silver"
          />
        </div>

        {/* Technician Utilization */}
        {bookings.technician_utilization && (
          <div className="mt-6">
            <BarChart
              title="Technician Utilization"
              data={bookings.technician_utilization.map((t) => ({
                label: t.technician,
                value: t.assigned_count,
              }))}
            />
          </div>
        )}
      </section>

      {/* Order Metrics */}
      <section>
        <h3 className="text-xl font-semibold text-warmwhite mb-4">Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ChartPlaceholder
            title="In Fabrication"
            value={orders.order_funnel?.fabrication || 0}
            color="cobalt"
          />
          <ChartPlaceholder
            title="Ready for Install"
            value={orders.order_funnel?.ready || 0}
            color="amber"
          />
          <ChartPlaceholder
            title="Avg Fab Time"
            value={`${orders.avg_fabrication_time_days || 0} days`}
            color="silver"
          />
          <ChartPlaceholder
            title="Repeat Customers"
            value={`${orders.repeat_customer_rate_percent || 0}%`}
            color="green"
          />
        </div>

        {/* Order Funnel */}
        {orders.order_funnel && (
          <div className="mt-6">
            <BarChart
              title="Order Funnel"
              data={[
                { label: "Quoted", value: orders.order_funnel.quoted || 0 },
                {
                  label: "Confirmed",
                  value: orders.order_funnel.confirmed || 0,
                },
                {
                  label: "Fabrication",
                  value: orders.order_funnel.fabrication || 0,
                },
                { label: "Ready", value: orders.order_funnel.ready || 0 },
                {
                  label: "Installed",
                  value: orders.order_funnel.installed || 0,
                },
              ]}
            />
          </div>
        )}
      </section>
    </div>
  );
}
