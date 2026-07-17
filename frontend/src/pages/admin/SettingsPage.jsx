import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { settingsApi } from "../../services/api.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner.jsx";

// ============================================================
// Default values (frontend fallbacks)
// ============================================================

const DEFAULT_VALUES = {
  mpesa_shortcode: "",
  mpesa_callback_url: "",
};

// ============================================================
// Settings Form Section Component
// ============================================================

function SettingsSection({ title, children }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-warmwhite mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ============================================================
// Admin Settings Page
// ============================================================

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch settings from API
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get(),
    enabled: !!user && user.role === "admin",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Compute form values: merge API data with defaults (fallback)
  const getSettingValue = (key) => {
    const apiValue = settingsData?.data?.data?.[key];
    return apiValue !== undefined && apiValue !== null ? apiValue : DEFAULT_VALUES[key];
  };

  const [mpesaConfig, setMpesaConfig] = useState({
    shortcode: DEFAULT_VALUES.mpesa_shortcode,
    callback_url: DEFAULT_VALUES.mpesa_callback_url,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync form values with fetched settings
  useEffect(() => {
    if (settingsData?.data?.data) {
      setMpesaConfig({
        shortcode: getSettingValue('mpesa_shortcode'),
        callback_url: getSettingValue('mpesa_callback_url'),
      });
    }
  }, [settingsData]);

  const handleMpesaChange = (e) => {
    const { name, value } = e.target;
    setMpesaConfig((prev) => ({ ...prev, [name]: value }));
  };

  // Mutation for saving settings
  const updateSettingsMutation = useMutation({
    mutationFn: (updates) => settingsApi.update(updates),
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Failed to save settings";
      toast.error(message);
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    
    // Prepare batch update from form state
    const updates = {
      mpesa_shortcode: mpesaConfig.shortcode || "",
      mpesa_callback_url: mpesaConfig.callback_url || "",
    };
    
    updateSettingsMutation.mutate(updates);
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
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-red-400">Failed to load settings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-heading font-bold text-warmwhite mb-2">
          Admin Settings
        </h2>
        <p className="text-silver-400">Configure system settings</p>
      </div>

      {/* M-Pesa Configuration */}
      <SettingsSection title="M-Pesa Configuration">
        <div>
          <label htmlFor="shortcode" className="input-label">
            Paybill/Till Number (Shortcode)
          </label>
          <input
            id="shortcode"
            type="text"
            name="shortcode"
            value={mpesaConfig.shortcode}
            onChange={handleMpesaChange}
            placeholder="e.g., 174379"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="callback_url" className="input-label">
            Callback URL
          </label>
          <input
            id="callback_url"
            type="url"
            name="callback_url"
            value={mpesaConfig.callback_url}
            onChange={handleMpesaChange}
            placeholder="https://api.yourdomain.com/payments/mpesa-callback"
            className="input-field"
          />
        </div>
        <div>
          <p className="text-sm text-silver-500">
            <span className="text-silver-400">Passkey:</span>{" "}
            <span className="text-yellow-400 font-medium">
              Configured via server environment (SAFARICOM_PASSKEY)
            </span>
          </p>
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving || updateSettingsMutation.isPending}
          className="btn-primary"
        >
          {isSaving || updateSettingsMutation.isPending
            ? "Saving..."
            : saved
            ? "Saved!"
            : "Save Settings"
          }
        </button>
      </div>
    </div>
  );
}