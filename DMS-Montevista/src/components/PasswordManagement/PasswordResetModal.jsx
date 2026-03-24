import { useState } from "react";
import Modal from "../common/Modal";
import ActionButton from "../common/ActionButton";
import { KeyRound, Eye, EyeOff } from "lucide-react";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition bg-white";

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className={`${inputClass} pr-9`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default function PasswordResetModal({ open, onClose, onSave, user, form, onChange, saving, error }) {
  const match = form.password && form.confirm_password && form.password === form.confirm_password;
  const mismatch = form.confirm_password && form.password !== form.confirm_password;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset Password"
      icon={KeyRound}
      size="sm"
      footer={
        <>
          <ActionButton label="Cancel" variant="secondary" tooltip="Discard" onClick={onClose} disabled={saving} />
          <ActionButton label={saving ? "Saving…" : "Reset Password"} tooltip="Apply new password" onClick={onSave} disabled={saving} />
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-blue-700">
              {user?.full_name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">{user?.full_name}</p>
            <p className="text-[10px] text-gray-500">@{user?.username}</p>
          </div>
        </div>

        <Field label="New Password" required>
          <PasswordInput
            value={form.password}
            onChange={(e) => onChange("password", e.target.value)}
            placeholder="Minimum 6 characters"
          />
        </Field>

        <Field label="Confirm Password" required>
          <PasswordInput
            value={form.confirm_password}
            onChange={(e) => onChange("confirm_password", e.target.value)}
            placeholder="Re-enter new password"
          />
          {mismatch && <p className="text-[10px] text-red-500 mt-1">Passwords do not match.</p>}
          {match && <p className="text-[10px] text-green-600 mt-1">Passwords match.</p>}
        </Field>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
