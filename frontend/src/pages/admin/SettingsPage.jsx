import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";

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
  const [mpesaConfig, setMpesaConfig] = useState({
    shortcode: "",
    passkey: "",
    callback_url: "",
  });
  const [emailTemplates, setEmailTemplates] = useState({
    quotation: "Your quotation {reference} is ready",
    order_status: "Order {reference} status updated to {status}",
    payment_received: "Payment received for order {reference}",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleMpesaChange = (e) => {
    const { name, value } = e.target;
    setMpesaConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (e) => {
    const { name, value } = e.target;
    setEmailTemplates((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In production, this would call the API to save settings
    // For now, just simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setIsSaving(false);
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="card text-center py-12">
        <p className="text-silver-400">Admin access required</p>
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
            Shortcode
          </label>
          <input
            id="shortcode"
            type="text"
            name="shortcode"
            value={mpesaConfig.shortcode}
            onChange={handleMpesaChange}
            placeholder="174379"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="passkey" className="input-label">
            Passkey
          </label>
          <input
            id="passkey"
            type="password"
            name="passkey"
            value={mpesaConfig.passkey}
            onChange={handleMpesaChange}
            placeholder="••••••••"
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
            placeholder="https://api.theolan.co.ke/payments/mpesa-callback"
            className="input-field"
          />
        </div>
      </SettingsSection>

      {/* Email Templates */}
      <SettingsSection title="Email Templates">
        <div>
          <label htmlFor="quotation" className="input-label">
            Quotation Template
          </label>
          <input
            id="quotation"
            type="text"
            name="quotation"
            value={emailTemplates.quotation}
            onChange={handleTemplateChange}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="order_status" className="input-label">
            Order Status Template
          </label>
          <input
            id="order_status"
            type="text"
            name="order_status"
            value={emailTemplates.order_status}
            onChange={handleTemplateChange}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="payment_received" className="input-label">
            Payment Received Template
          </label>
          <input
            id="payment_received"
            type="text"
            name="payment_received"
            value={emailTemplates.payment_received}
            onChange={handleTemplateChange}
            className="input-field"
          />
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary"
        >
          {isSaving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
