import { useState, useEffect, useRef } from "react";
import { FileText, UploadCloud, X, Image, Trash2, Plus } from "lucide-react";
import Modal from "../common/Modal";
import ActionButton from "../common/ActionButton";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition bg-white";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";
const selectClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition bg-white appearance-none";

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

export default function DocumentFormModal({
  open,
  onClose,
  onSave,
  editData,
  documentTypes = [],
  sectors = [],
  subsectors = [],
  saving,
}) {
  const isEdit = !!editData;
  const fileRef = useRef(null);

  // ── Form state ────────────────────────────────────────────
  const [form, setForm] = useState({
    document_type_id: "",
    document_number: "",
    series_year: new Date().getFullYear(),
    title: "",
    sector_id: "",
    subsector_id: "",
    session_date: "",
    session_type: "",
    session_number: "",
    author: "",
    presiding_officer: "",
    attested_by: "",
    approved_by: "",
    content_text: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [error, setError] = useState("");

  // ── Populate on edit ──────────────────────────────────────
  useEffect(() => {
    if (open && editData) {
      setForm({
        document_type_id: editData.document_type_id || "",
        document_number: editData.document_number || "",
        series_year: editData.series_year || new Date().getFullYear(),
        title: editData.title || "",
        sector_id: editData.sector_id || "",
        subsector_id: editData.subsector_id || "",
        session_date: editData.session_date ? editData.session_date.slice(0, 10) : "",
        session_type: editData.session_type || "",
        session_number: editData.session_number || "",
        author: editData.author || "",
        presiding_officer: editData.presiding_officer || "",
        attested_by: editData.attested_by || "",
        approved_by: editData.approved_by || "",
        content_text: editData.content_text || "",
        description: editData.description || "",
      });
      setExistingFile(editData.file_name ? { name: editData.file_name, size: editData.file_size } : null);
      setFile(null);
    } else if (open) {
      setForm({
        document_type_id: "",
        document_number: "",
        series_year: new Date().getFullYear(),
        title: "",
        sector_id: "",
        subsector_id: "",
        session_date: "",
        session_type: "",
        session_number: "",
        author: "",
        presiding_officer: "",
        attested_by: "",
        approved_by: "",
        content_text: "",
        description: "",
      });
      setFile(null);
      setExistingFile(null);
    }
    setError("");
  }, [open, editData]);

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setError("");
  };

  // ── File handling ─────────────────────────────────────────
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) {
      setError("Only PDF and image files are allowed.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File exceeds the 10 MB limit.");
      return;
    }
    setFile(f);
    setExistingFile(null);
    setError("");
  };

  const removeFile = () => {
    setFile(null);
    setExistingFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Filtered subsectors ───────────────────────────────────
  const filteredSubs = form.sector_id
    ? subsectors.filter((s) => s.sector_id === parseInt(form.sector_id))
    : subsectors;

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!form.document_type_id) return setError("Document type is required.");
    if (!form.document_number.trim()) return setError("Document number is required.");
    if (!form.series_year) return setError("Series year is required.");
    if (!form.title.trim()) return setError("Title is required.");

    onSave({ ...form, file });
  };

  const currentFile = file || existingFile;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Document" : "Add New Document"}
      icon={FileText}
      size="2xl"
      footer={
        <>
          <ActionButton label="Cancel" variant="secondary" onClick={onClose} disabled={saving} />
          <ActionButton label={saving ? "Saving…" : "Save Document"} onClick={handleSubmit} disabled={saving} />
        </>
      }
    >
      <div className="space-y-4">
        {/* Row 1: Type, Number, Year */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              className={selectClass}
              value={form.document_type_id}
              onChange={(e) => set("document_type_id", e.target.value)}
            >
              <option value="">Select type…</option>
              {documentTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.type_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>
              Document No. <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. 153"
              value={form.document_number}
              onChange={(e) => set("document_number", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>
              Series Year <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              type="number"
              min={2000}
              max={2100}
              value={form.series_year}
              onChange={(e) => set("series_year", e.target.value)}
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={labelClass}>
            Title / Subject <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            placeholder="Full title of the document…"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        {/* Row 2: Sector, Subsector */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Sector</label>
            <select
              className={selectClass}
              value={form.sector_id}
              onChange={(e) => { set("sector_id", e.target.value); set("subsector_id", ""); }}
            >
              <option value="">— None —</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>{s.sector_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Subsector</label>
            <select
              className={selectClass}
              value={form.subsector_id}
              onChange={(e) => set("subsector_id", e.target.value)}
            >
              <option value="">— None —</option>
              {filteredSubs.map((s) => (
                <option key={s.id} value={s.id}>{s.subsector_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Session details */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Session Date</label>
            <input
              className={inputClass}
              type="date"
              value={form.session_date}
              onChange={(e) => set("session_date", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Session Type</label>
            <select
              className={selectClass}
              value={form.session_type}
              onChange={(e) => set("session_type", e.target.value)}
            >
              <option value="">Select…</option>
              <option value="Regular">Regular</option>
              <option value="Special">Special</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Session No.</label>
            <input
              className={inputClass}
              placeholder="e.g. 1st"
              value={form.session_number}
              onChange={(e) => set("session_number", e.target.value)}
            />
          </div>
        </div>

        {/* Row 4: Signatories */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Author / Sponsor</label>
            <input
              className={inputClass}
              placeholder="e.g. Hon. Joseph T. Jauod"
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Presiding Officer</label>
            <input
              className={inputClass}
              placeholder="e.g. Hon. Evergisto S. Balunos"
              value={form.presiding_officer}
              onChange={(e) => set("presiding_officer", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Attested By</label>
            <input
              className={inputClass}
              placeholder="Secretary to the Sanggunian"
              value={form.attested_by}
              onChange={(e) => set("attested_by", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Approved By</label>
            <input
              className={inputClass}
              placeholder="Municipal Mayor"
              value={form.approved_by}
              onChange={(e) => set("approved_by", e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description / Notes</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            placeholder="Brief summary or notes…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {/* Content text (searchable) */}
        <div>
          <label className={labelClass}>
            Content Text <span className="text-gray-400 font-normal">(extracted / searchable)</span>
          </label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={4}
            placeholder="Paste the full document text here for search indexing…"
            value={form.content_text}
            onChange={(e) => set("content_text", e.target.value)}
          />
        </div>

        {/* File upload */}
        <div>
          <label className={labelClass}>Document File</label>
          {currentFile ? (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              {file?.type === "application/pdf" || existingFile?.name?.endsWith(".pdf") ? (
                <FileText className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <Image className="w-5 h-5 text-blue-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {file?.name || existingFile?.name}
                </p>
                {(file?.size || existingFile?.size) && (
                  <p className="text-xs text-gray-400">{formatSize(file?.size || existingFile?.size)}</p>
                )}
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
            >
              <UploadCloud className="w-6 h-6 text-gray-400" />
              <p className="text-xs text-gray-500">
                Click to upload PDF or image <span className="text-gray-400">(max 10 MB)</span>
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>
    </Modal>
  );
}
