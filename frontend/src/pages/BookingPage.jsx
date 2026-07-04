import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { bookingApi } from "../services/api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import DateTimePicker from "../components/DateTimePicker.jsx";

const SERVICE_TYPES = [
  { value: "windows", label: "Windows", icon: "🪟" },
  { value: "doors", label: "Doors", icon: "🚪" },
  { value: "curtain_wall", label: "Curtain Walls", icon: "🏢" },
  { value: "partitions", label: "Partitions", icon: "🔲" },
  { value: "balustrades", label: "Balustrades", icon: "🏗️" },
  { value: "glazing", label: "Glazing", icon: "✨" },
];

const PROPERTY_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
];

const CONTACT_METHODS = [
  { value: "sms", label: "SMS" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

const STEPS = ["Service", "Date & Time", "Details", "Review"];

export default function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    service_type: "",
    property_type: "residential",
    location: "",
    scheduled_at: "",
    contact_method: "sms",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  // Available slots query
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 90);

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["available-slots"],
    queryFn: () =>
      bookingApi.getAvailableSlots({
        start_date: today.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      }),
    enabled: step >= 1,
  });

  // Group slots by date
  // API wraps response as: { success: true, data: [...], total_slots, date_range }
  // Axios response: response.data = { success, data: [...], ... }
  const slotsByDate = {};

  // Safe access with defaults
  const apiResponse = slotsData?.data;
  let slotsArray = null;

  if (apiResponse) {
    // Handle nested response structure
    // apiResponse = { success, data: [...], total_slots, date_range }
    // So apiResponse.data contains the actual slots array
    if (Array.isArray(apiResponse.data)) {
      slotsArray = apiResponse.data;
    }
  }

  // Extract date groups from slots
  if (slotsArray && Array.isArray(slotsArray)) {
    slotsArray.forEach((dateGroup) => {
      const dateKey = dateGroup?.date;
      if (!dateKey || !Array.isArray(dateGroup?.slots)) return;
      slotsByDate[dateKey] = dateGroup.slots;
    });
  } else if (apiResponse && !Array.isArray(apiResponse)) {
    // Try to handle object keyed by date as fallback
    console.warn(
      "Warning: Could not find slots array in response",
      apiResponse,
    );
    if (apiResponse.data && typeof apiResponse.data === "object") {
      Object.entries(apiResponse.data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Check if this could be date-keyed slots
          const isDateKey = /^\d{4}-\d{2}-\d{2}$/.test(key);
          if (isDateKey) {
            slotsByDate[key] = value;
          }
        }
      });
    }
  }

  const availableDates = Object.keys(slotsByDate).sort();
  console.log("Final availableDates:", availableDates);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.service_type) errs.service_type = "Select a service type";
    }
    if (s === 1) {
      if (!form.scheduled_at) errs.scheduled_at = "Select a date and time";
    }
    if (s === 2) {
      if (!form.location || form.location.trim().length < 3)
        errs.location = "Location is required (min 3 characters)";
    }
    return errs;
  };

  const nextStep = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const createBookingMutation = useMutation({
    mutationFn: (data) => bookingApi.create(data),
    onSuccess: (res) => {
      const ref =
        res?.data?.data?.reference_number || res?.data?.reference_number || "";
      navigate(`/bookings?booking_confirmed=${ref}`, { replace: true });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Booking failed. Please try again.";
      setErrors({ submit: msg });
    },
  });

  const handleSubmit = () => {
    if (!user) {
      navigate("/auth/login?redirect=/booking");
      return;
    }
    createBookingMutation.mutate({
      service_type: form.service_type,
      property_type: form.property_type,
      location: form.location,
      scheduled_at: form.scheduled_at,
      contact_method: form.contact_method,
      notes: form.notes || undefined,
    });
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-charcoal-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">
            Book a Visit
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-warmwhite mb-4">
            Schedule a Site Visit
          </h1>
          <p className="text-silver-300 max-w-2xl">
            Our technicians will visit your site, take measurements, and provide
            a detailed quotation. Free within Nairobi.
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <section className="border-b border-charcoal-600 bg-charcoal-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((label, idx) => (
              <div key={label} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    idx < step
                      ? "bg-cobalt text-white"
                      : idx === step
                        ? "bg-cobalt/20 text-cobalt-300 border-2 border-cobalt"
                        : "bg-charcoal-700 text-silver-500"
                  }`}
                >
                  {idx < step ? "✓" : idx + 1}
                </div>
                <span
                  className={`hidden sm:inline ml-2 text-sm ${
                    idx === step ? "text-warmwhite" : "text-silver-500"
                  }`}
                >
                  {label}
                </span>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 lg:w-24 h-0.5 mx-2 ${
                      idx < step ? "bg-cobalt" : "bg-charcoal-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step 0: Service Selection */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-heading font-bold text-warmwhite mb-6">
              What service do you need?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SERVICE_TYPES.map((svc) => (
                <button
                  key={svc.value}
                  type="button"
                  onClick={() => handleChange("service_type", svc.value)}
                  className={`card text-center hover:border-cobalt/50 transition-all ${
                    form.service_type === svc.value
                      ? "border-cobalt bg-cobalt/10"
                      : ""
                  }`}
                >
                  <span className="text-3xl block mb-2">{svc.icon}</span>
                  <span className="text-warmwhite font-medium text-sm">
                    {svc.label}
                  </span>
                </button>
              ))}
            </div>
            {errors.service_type && (
              <p className="input-error mt-2">{errors.service_type}</p>
            )}
          </div>
        )}

        {/* Step 1: Date &amp; Time - Using Professional DateTimePicker */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-heading font-bold text-warmwhite mb-6">
              Choose a date and time
            </h2>
            <DateTimePicker
              availableDates={availableDates}
              slotsByDate={slotsByDate}
              selectedDate={form._selectedDate}
              selectedTime={form.scheduled_at}
              onSelectDate={(date) => {
                handleChange("scheduled_at", "");
                setForm((prev) => ({ ...prev, _selectedDate: date }));
              }}
              onSelectTime={(time) => handleChange("scheduled_at", time)}
              loading={slotsLoading}
              className="mt-4"
            />
            {errors.scheduled_at && (
              <p className="input-error mt-2">{errors.scheduled_at}</p>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-heading font-bold text-warmwhite mb-6">
              Your Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="input-label">Property Type</label>
                <div className="flex gap-3">
                  {PROPERTY_TYPES.map((pt) => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => handleChange("property_type", pt.value)}
                      className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                        form.property_type === pt.value
                          ? "border-cobalt bg-cobalt/10 text-warmwhite"
                          : "border-charcoal-600 text-silver-400 hover:border-cobalt/50"
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="input-label">Location / Address *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className={`input-field ${errors.location ? "border-red-500" : ""}`}
                  placeholder="e.g. Karen, Nairobi — Plot 23 Likoni Drive"
                />
                {errors.location && (
                  <p className="input-error">{errors.location}</p>
                )}
              </div>
              <div>
                <label className="input-label">Preferred Contact Method</label>
                <div className="flex gap-3">
                  {CONTACT_METHODS.map((cm) => (
                    <button
                      key={cm.value}
                      type="button"
                      onClick={() => handleChange("contact_method", cm.value)}
                      className={`px-4 py-2 rounded-md border text-sm transition-colors ${
                        form.contact_method === cm.value
                          ? "border-cobalt bg-cobalt/10 text-warmwhite"
                          : "border-charcoal-600 text-silver-400 hover:border-cobalt/50"
                      }`}
                    >
                      {cm.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="input-label">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Any special requirements, measurements, or details..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-heading font-bold text-warmwhite mb-6">
              Review Your Booking
            </h2>
            <div className="card space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-silver-500 uppercase tracking-wider">
                    Service
                  </p>
                  <p className="text-warmwhite font-medium capitalize">
                    {form.service_type?.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-silver-500 uppercase tracking-wider">
                    Property Type
                  </p>
                  <p className="text-warmwhite font-medium capitalize">
                    {form.property_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-silver-500 uppercase tracking-wider">
                    Date &amp; Time
                  </p>
                  <p className="text-warmwhite font-medium">
                    {form.scheduled_at
                      ? new Date(form.scheduled_at).toLocaleDateString(
                          "en-KE",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        ) +
                        " at " +
                        new Date(form.scheduled_at).toLocaleTimeString(
                          "en-KE",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "Not selected"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-silver-500 uppercase tracking-wider">
                    Contact Method
                  </p>
                  <p className="text-warmwhite font-medium capitalize">
                    {form.contact_method}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-silver-500 uppercase tracking-wider">
                    Location
                  </p>
                  <p className="text-warmwhite font-medium">{form.location}</p>
                </div>
                {form.notes && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-silver-500 uppercase tracking-wider">
                      Notes
                    </p>
                    <p className="text-silver-300">{form.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {!user && (
              <div className="card mt-4 border-gold/30 bg-gold/5">
                <p className="text-gold-400 text-sm">
                  You&apos;ll need to log in or create an account to confirm
                  this booking.
                </p>
              </div>
            )}

            {errors.submit && (
              <div className="card mt-4 border-red-500/30 bg-red-500/5">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10">
          {step > 0 ? (
            <button type="button" onClick={prevStep} className="btn-ghost">
              Back
            </button>
          ) : (
            <Link to="/" className="btn-ghost">
              Cancel
            </Link>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                "Confirm Booking"
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
