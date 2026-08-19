import { useState } from "react";
import ResetDataModal from "../components/ResetDataModal";

function Settings({ settings, onSave, onResetData, onLogout })  {
  const [draft, setDraft] = useState(settings);
  const [showReset, setShowReset] = useState(false);

  const update = (event) => {
    const { name, value, type, checked } = event.target;

    setDraft((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const save = (event) => {
    event.preventDefault();
    onSave(draft);
  };

  return (
    <section className="settings-page" id="settings">

      <div className="page-heading">
        <div>
          <h2>Settings</h2>
          <p>Manage your personal preferences and account data.</p>
        </div>
      </div>

      <form className="settings-stack" onSubmit={save}>

        {/* Profile */}
        <section className="dashboard-panel settings-panel">
          <div className="settings-panel__heading">
            <h3>Profile</h3>
            <p>Your details appear in the FinTrack workspace.</p>
          </div>

          <div className="settings-form">
            <label className="form-field">
              <span>Name</span>
              <input
                name="name"
                value={draft.name}
                onChange={update}
                required
              />
            </label>

            <label className="form-field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={draft.email}
                onChange={update}
                required
              />
            </label>

            <label className="form-field">
              <span>Currency</span>
              <select
                name="currency"
                value={draft.currency}
                onChange={update}
              >
                <option value="INR">Indian Rupee (₹)</option>
              </select>
            </label>
          </div>
        </section>

        {/* Notifications */}
        <section className="dashboard-panel settings-panel">
          <div className="settings-panel__heading">
            <h3>Notifications</h3>
            <p>Choose the reminders you want to see in FinTrack.</p>
          </div>

          <div className="preference-list">

            <label className="preference-row">
              <span>
                <strong>Budget alerts</strong>
                <small>
                  Get notified when a budget is nearing its limit.
                </small>
              </span>

              <input
                type="checkbox"
                name="budgetAlerts"
                checked={draft.budgetAlerts}
                onChange={update}
              />

              <i aria-hidden="true" />
            </label>

            <label className="preference-row">
              <span>
                <strong>Payment reminders</strong>
                <small>
                  Get reminders for upcoming recurring payments.
                </small>
              </span>

              <input
                type="checkbox"
                name="paymentReminders"
                checked={draft.paymentReminders}
                onChange={update}
              />

              <i aria-hidden="true" />
            </label>

          </div>
        </section>

        {/* Save */}
        <div className="settings-actions">
          <button
            className="button button--primary"
            type="submit"
          >
            Save settings
          </button>
        </div>

      </form>

      <section className="dashboard-panel">
      <div>
        <h3>Account</h3>
        <p>Sign out of your FinTrack account.</p>
      </div>

      <button
        className="button button--danger"
        type="button"
        onClick={onLogout}
      >
      Logout
      </button>
    </section>
      <section
        className="dashboard-panel danger-panel"
        style={{ marginTop: "32px" }}
      >
        <div>
          <h3>Clear my data</h3>
          <p>
            Permanently delete all your transactions, budgets, and savings goals.
          </p>
        </div>

        <button
          className="button button--danger"
          type="button"
          onClick={() => setShowReset(true)}
        >
          Clear data
        </button>
      </section>

      {showReset && (
        <ResetDataModal
          onClose={() => setShowReset(false)}
          onConfirm={() => {
            onResetData();
            setShowReset(false);
          }}
        />
      )}

    </section>
  );
}

export default Settings;