import { useState, useEffect, useRef } from "react";
import { FileText, UploadCloud, X, Image, Loader2 } from "lucide-react";
import api from "../../api/axiosInstance";
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

const fileIcon = (file) => {
  const name = file.name || file.file_name || "";
  const type = file.type || file.file_type || "";
  if (type === "application/pdf" || name.endsWith(".pdf"))
    return <FileText className="w-4 h-4 text-red-500 shrink-0" />;
  return <Image className="w-4 h-4 text-blue-500 shrink-0" />;
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
  const [newFiles, setNewFiles] = useState([]);        // File objects to upload
  const [existingFiles, setExistingFiles] = useState([]); // Already saved files (edit mode)
  const [removedFileIds, setRemovedFileIds] = useState([]); // IDs of files to delete
  const [error, setError] = useState("");
  const [extracting, setExtracting] = useState(false);

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
      setExistingFiles(editData.files || []);
      setNewFiles([]);
      setRemovedFileIds([]);
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
      setNewFiles([]);
      setExistingFiles([]);
      setRemovedFileIds([]);
    }
    setError("");
    setExtracting(false);
  }, [open, editData]);

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setError("");
  };

  // ── File handling + auto-extract ──────────────────────────
  const handleFiles = async (incoming) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    const toAdd = [];

    for (const f of Array.from(incoming)) {
      if (!allowed.includes(f.type)) {
        setError(`"${f.name}" is not a PDF or image.`);
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        setError(`"${f.name}" exceeds the 10 MB limit.`);
        continue;
      }
      // Skip duplicates
      const alreadyAdded = newFiles.some((nf) => nf.name === f.name && nf.size === f.size);
      const alreadyExists = existingFiles.some((ef) => ef.file_name === f.name);
      if (!alreadyAdded && !alreadyExists) toAdd.push(f);
    }

    if (!toAdd.length) return;

    const allNew = [...newFiles, ...toAdd];
    setNewFiles(allNew);

    // Auto-extract from ALL new files (only on first upload batch for add mode)
    if (!isEdit && newFiles.length === 0) {
      setExtracting(true);
      try {
        const fd = new FormData();
        toAdd.forEach((f) => fd.append("files", f));
        const { data } = await api.post("/documents/extract", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000,
        });

        if (data.extracted) {
          const ext = data.extracted;
          setForm((prev) => ({
            ...prev,
            document_type_id: ext.document_type_id || prev.document_type_id,
            document_number: ext.document_number || prev.document_number,
            series_year: ext.series_year || prev.series_year,
            title: ext.title || prev.title,
            session_date: ext.session_date || prev.session_date,
            session_type: ext.session_type || prev.session_type,
            session_number: ext.session_number || prev.session_number,
            author: ext.author || prev.author,
            presiding_officer: ext.presiding_officer || prev.presiding_officer,
            attested_by: ext.attested_by || prev.attested_by,
            approved_by: ext.approved_by || prev.approved_by,
            content_text: ext.content_text || prev.content_text,
          }));
        }
      } catch {
        // Extraction failed — user can fill manually
      } finally {
        setExtracting(false);
      }
    }
  };

  const onInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const removeNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingFile = (fileId) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
    setRemovedFileIds((prev) => [...prev, fileId]);
  };

  // ── Drag handlers ─────────────────────────────────────────
  const [dragging, setDragging] = useState(false);
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
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

    onSave({ ...form, files: newFiles, removedFileIds });
  };

  const totalFiles = existingFiles.length + newFiles.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Document" : "Add New Document"}
      icon={FileText}
      size="2xl"
      footer={
        <>
          <ActionButton label="Cancel" variant="secondary" onClick={onClose} disabled={saving || extracting} />
          <ActionButton label={saving ? "Saving…" : "Save Document"} onClick={handleSubmit} disabled={saving || extracting} />
        </>
      }
    >
      <div className="space-y-4">
        {/* ── File upload (first!) ──────────────────────────── */}
        <div>
          <label className={labelClass}>
            Upload Document Files
            {!isEdit && <span className="text-gray-400 font-normal ml-1">(auto-fills form fields)</span>}
          </label>

          {/* Drop zone */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 cursor-pointer transition-colors
              ${dragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50"
              }`}
          >
            <UploadCloud className={`w-6 h-6 ${dragging ? "text-blue-500" : "text-gray-400"}`} />
            <p className="text-xs text-gray-500">
              Drag & drop or click to upload PDF / images <span className="text-gray-400">(max 10 MB each)</span>
            </p>
            {!isEdit && (
              <p className="text-xs text-blue-500 font-medium">
                Data will be extracted automatically from uploaded files
              </p>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,image/*"
            className="hidden"
            onChange={onInputChange}
          />

          {/* Extracting indicator */}
          {extracting && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
              <p className="text-xs text-blue-600">
                Extracting document data… Fields will be auto-filled when done.
              </p>
            </div>
          )}

          {/* File list */}
          {totalFiles > 0 && (
            <ul className="mt-2 space-y-1.5">
              {/* Existing files (edit mode) */}
              {existingFiles.map((f) => (
                <li key={`ex-${f.id}`} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2">
                  {fileIcon(f)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{f.file_name}</p>
                    <p className="text-xs text-gray-400">{formatSize(f.file_size)}</p>
                  </div>
                  <span className="text-xs text-green-500 font-medium mr-1">Saved</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeExistingFile(f.id); }}
                    className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
              {/* New files */}
              {newFiles.map((f, i) => (
                <li key={`new-${i}`} className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2">
                  {fileIcon(f)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{f.name}</p>
                    <p className="text-xs text-gray-400">{formatSize(f.size)}</p>
                  </div>
                  <span className="text-xs text-blue-500 font-medium mr-1">New</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeNewFile(i); }}
                    className="p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

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
            placeholder="Full document text for search indexing (auto-filled from upload)…"
            value={form.content_text}
            onChange={(e) => set("content_text", e.target.value)}
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
