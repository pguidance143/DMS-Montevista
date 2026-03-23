import Modal from "../common/Modal";
import ActionButton from "../common/ActionButton";
import { ShieldPlus, ShieldCheck, CheckSquare, Square } from "lucide-react";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition bg-white";

const Field = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
  </div>
);

export default function RoleFormModal({ open, onClose, onSave, form, onChange, pages, editMode, saving, error }) {
  const field = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    onChange(key, value);
  };

  const togglePage = (pageId) => {
    const current = form.page_ids || [];
    const updated = current.includes(pageId)
      ? current.filter((id) => id !== pageId)
      : [...current, pageId];
    onChange("page_ids", updated);
  };

  const selectedIds = form.page_ids || [];
  const allSelected = pages.length > 0 && pages.every((p) => selectedIds.includes(p.page_id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    onChange("page_ids", allSelected ? [] : pages.map((p) => p.page_id));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editMode ? "Edit Role" : "Add New Role"}
      icon={editMode ? ShieldCheck : ShieldPlus}
      size="2xl"
      footer={
        <>
          <ActionButton label="Cancel" variant="secondary" tooltip="Discard changes" onClick={onClose} disabled={saving} />
          <ActionButton label={saving ? "Saving…" : "Save Role"} tooltip="Save role and permissions" onClick={onSave} disabled={saving} />
        </>
      }
    >
      <div className="grid grid-cols-2 gap-6 min-h-[360px]">

        {/* ── Left: Role Details ── */}
        <div className="flex flex-col gap-4">
          <div className="pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role Details</p>
          </div>

          <Field label="Role Name" required>
            <input
              className={inputClass}
              placeholder="e.g. Document Encoder"
              value={form.role_name}
              onChange={field("role_name")}
            />
          </Field>

          <Field label="Description" hint="A short summary of what this role can do.">
            <textarea
              className={`${inputClass} resize-none`}
              rows={4}
              placeholder="e.g. Can upload and track documents but cannot approve."
              value={form.description}
              onChange={field("description")}
            />
          </Field>

          <div className="mt-auto">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div>
                <p className="text-xs font-medium text-gray-700">Active Role</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Inactive roles cannot be assigned to users.</p>
              </div>
              <button
                type="button"
                onClick={() => onChange("is_active", !form.is_active)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer focus:outline-none ${
                  form.is_active ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                    form.is_active ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* ── Right: Page Access ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Page Access</p>
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {selectedIds.length} / {pages.length} selected
            </span>
          </div>

          {pages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
              Loading pages…
            </div>
          ) : (
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={toggleAll}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg border transition ${
                  allSelected
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <span className={`flex-shrink-0 ${allSelected || someSelected ? "text-blue-500" : "text-gray-300"}`}>
                  {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </span>
                <span className="text-xs font-semibold text-gray-600">
                  {allSelected ? "Deselect All" : "Select All Pages"}
                </span>
              </button>

              <div className="border-t border-gray-100 my-1" />

              {pages.map((p) => {
                const checked = selectedIds.includes(p.page_id);
                return (
                  <button
                    key={p.page_id}
                    type="button"
                    onClick={() => togglePage(p.page_id)}
                    className={`flex items-start gap-3 w-full text-left px-3 py-2.5 rounded-lg border transition ${
                      checked
                        ? "border-blue-200 bg-blue-50"
                        : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`flex-shrink-0 mt-0.5 ${checked ? "text-blue-500" : "text-gray-300"}`}>
                      {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-gray-700">{p.page_name}</p>
                      {p.description && (
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{p.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
