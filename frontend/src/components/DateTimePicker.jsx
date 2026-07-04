import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner.jsx";

// Helper functions for date manipulation
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfWeek = (date, weekStartsOn = 1) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day < weekStartsOn ? 7 + day : day) - weekStartsOn;
  result.setDate(result.getDate() - diff);
  return result;
};

const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isToday = (date) => {
  const today = new Date();
  return isSameDay(date, today);
};

const isFuture = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate >= today;
};

const formatDate = (date, formatStr = "EEEE, MMMM d, yyyy") => {
  const options = {
    weekday: formatStr.includes("EEE") ? "short" : "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-KE", options);
};

const formatDay = (date) => {
  return new Date(date).getDate();
};

const formatMonthYear = (date) => {
  return new Date(date).toLocaleDateString("en-KE", {
    month: "long",
    year: "numeric",
  });
};

const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const DateTimePicker = ({
  availableDates = [],
  slotsByDate = {},
  selectedDate = null,
  selectedTime = null,
  onSelectDate = () => {},
  onSelectTime = () => {},
  loading = false,
  className = "",
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Generate days in the current month view (6 weeks = 42 days)
  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const startDate = startOfWeek(startOfMonth, 1); // Monday as first day
  const daysInView = [];
  for (let i = 0; i < 42; i++) {
    daysInView.push(addDays(startDate, i));
  }

  const monthYearString = formatMonthYear(currentMonth);

  const isAvailableDate = (date) => {
    const dateStr =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");
    return availableDates.includes(dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  const handleDayClick = (day) => {
    const dateStr =
      day.getFullYear() +
      "-" +
      String(day.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(day.getDate()).padStart(2, "0");
    if (isAvailableDate(day) && isFuture(day)) {
      onSelectDate(dateStr);
      setShowCalendar(false);
    }
  };

  // Auto-open calendar on focus
  useEffect(() => {
    if (showCalendar) {
      setCurrentMonth(selectedDate ? new Date(selectedDate) : new Date());
    }
  }, [showCalendar, selectedDate]);

  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    return slotsByDate[selectedDate] || [];
  };

  // Auto-open/close based on calendar visibility
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const target = e.target;
      if (!target.closest(".datetime-picker-container")) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showCalendar]);

  return (
    <div className={`datetime-picker-container relative ${className}`}>
      {/* Date Selection Button / Display */}
      <div className="mb-6">
        <label className="input-label block mb-2">Select Date</label>
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full card flex items-center justify-between px-4 py-3 text-left hover:border-cobalt/50 transition-all"
        >
          <span className={selectedDate ? "text-warmwhite" : "text-silver-400"}>
            {selectedDate
              ? formatDate(new Date(selectedDate), "EEEE, MMMM d, yyyy")
              : "Choose a date"}
          </span>
          <svg
            className={`w-5 h-5 text-silver-500 transition-transform ${showCalendar ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div className="card absolute z-50 w-full max-w-sm mb-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-charcoal-600 text-silver-400 hover:border-cobalt hover:text-cobalt transition-colors"
            >
              <span className="text-sm font-bold">‹</span>
            </button>
            <span className="text-lg font-medium text-warmwhite">
              {monthYearString}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-charcoal-600 text-silver-400 hover:border-cobalt hover:text-cobalt transition-colors"
            >
              <span className="text-sm font-bold">›</span>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-silver-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysInView.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isSelected =
                selectedDate && isSameDay(day, new Date(selectedDate));
              const isDayToday = isToday(day);
              const available = isAvailableDate(day);
              const canSelect = isFuture(day) && available;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={!canSelect}
                  className={`aspect-square rounded-md text-sm font-medium transition-all ${
                    !isCurrentMonth
                      ? "bg-transparent text-silver-600"
                      : canSelect
                        ? "hover:bg-cobalt/10 hover:text-cobalt cursor-pointer"
                        : "text-silver-500 cursor-not-allowed"
                  } ${
                    isSelected
                      ? "bg-cobalt text-white shadow-md"
                      : isDayToday && isCurrentMonth
                        ? "bg-charcoal-600 text-warmwhite border border-cobalt"
                        : ""
                  }`}
                >
                  {formatDay(day)}
                </button>
              );
            })}
          </div>

          {/* Available Dates Legend */}
          <div className="mt-4 p-3 bg-charcoal-600/50 rounded-md">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cobalt/20"></div>
                <span className="text-silver-400">Available dates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-charcoal-600 border border-cobalt"></div>
                <span className="text-silver-400">Today</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Slots Selection */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : selectedDate ? (
        <div>
          <label className="input-label block mb-2">Available Times</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {getSlotsForSelectedDate().length > 0 ? (
              getSlotsForSelectedDate().map((slot) => {
                const slotDatetime = `${selectedDate}T${slot.start_time}`;
                const isSelected = selectedTime === slotDatetime;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectTime(slotDatetime)}
                    className={`p-3 rounded-md border text-center transition-all ${
                      isSelected
                        ? "border-cobalt bg-cobalt/10 text-warmwhite"
                        : "border-charcoal-600 text-silver-300 hover:border-cobalt/50"
                    }`}
                  >
                    <span className="text-sm font-medium block">
                      {formatTimeDisplay(slot.start_time)}
                    </span>
                    <span className="text-xs text-silver-500 block mt-0.5">
                      to {formatTimeDisplay(slot.end_time)}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full card text-center py-6">
                <p className="text-silver-400 text-sm">
                  No time slots available for this date
                </p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Error state when no dates available */}
      {!loading && availableDates.length === 0 && showCalendar && (
        <div className="card mb-6">
          <p className="text-silver-400 text-center py-4">
            No available dates in this period
          </p>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
