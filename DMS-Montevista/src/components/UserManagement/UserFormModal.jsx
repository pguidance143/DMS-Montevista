import Modal from "../common/Modal";
import ActionButton from "../common/ActionButton";
import { UserPlus, UserPen } from "lucide-react";

const ROLES = [
  { id: 1, label: "Admin" },
  { id: 2, label: "Staff" },
  { id: 3, label: "Public User" },
];

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

export default function UserFormModal({ open, onClose, onSave, form, onChange, editMode, saving, error }) {
  const field = (key) => (e) => onChange(key, e.target.value);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editMode ? "Edit User" : "Add New User"}
      icon={editMode ? UserPen : UserPlus}
      footer={
        <>
          <ActionButton label="Cancel" variant="secondary" tooltip="Discard changes" onClick={onClose} disabled={saving} />
          <ActionButton label={saving ? "Saving…" : "Save"} tooltip="Save user details" onClick={onSave} disabled={saving} />
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Full Name" required>
          <input
            className={inputClass}
            placeholder="e.g. Juan Dela Cruz"
            value={form.full_name}
            onChange={field("full_name")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Username" required>
            <input
              className={inputClass}
              placeholder="e.g. jdelacruz"
              value={form.username}
              onChange={field("username")}
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              className={inputClass}
              placeholder="e.g. juan@gov.ph"
              value={form.email}
              onChange={field("email")}
            />
          </Field>
        </div>

        {!editMode && (
          <Field label="Password" required>
            <input
              type="password"
              className={inputClass}
              placeholder="Set initial password"
              value={form.password}
              onChange={field("password")}
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Role">
            <select className={inputClass} value={form.role_id} onChange={field("role_id")}>
              <option value="">— Select role —</option>
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Department ID">
            <input
              type="number"
              className={inputClass}
              placeholder="Optional"
              value={form.department_id}
              onChange={field("department_id")}
            />
          </Field>
        </div>

        {error && <p className="text-xs text-red-500 pt-1">{error}</p>}
      </div>
    </Modal>
  );
}
