import { useState, useRef, useCallback } from "react";
import { FilePlus, FileText, Image, X, UploadCloud } from "lucide-react";
import ActionButton from "../../components/common/ActionButton";

const MAX_SIZE_MB = 10;
const ACCEPTED    = [".pdf", "image/*"];
const ACCEPT_ATTR = ".pdf,image/*";

const formatSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

const fileIcon = (file) => {
  if (file.type === "application/pdf")
    return <FileText className="w-5 h-5 text-red-500 shrink-0" />;
  return <Image className="w-5 h-5 text-blue-500 shrink-0" />;
};

export default function AddNewDocument() {
  const [files, setFiles]       = useState([]);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors]     = useState([]);
  const inputRef                = useRef(null);

  // ── File helpers ─────────────────────────────────────────
  const isAccepted = (file) =>
    file.type === "application/pdf" || file.type.startsWith("image/");

  const addFiles = useCallback((incoming) => {
    const newErrors = [];
    const toAdd = [];

    Array.from(incoming).forEach((file) => {
      if (!isAccepted(file)) {
        newErrors.push(`"${file.name}" is not a PDF or image.`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        newErrors.push(`"${file.name}" exceeds the ${MAX_SIZE_MB} MB limit.`);
        return;
      }
      toAdd.push(file);
    });

    setErrors(newErrors);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...toAdd.filter((f) => !existingNames.has(f.name))];
    });
  }, []);

  const removeFile = (name) =>
    setFiles((prev) => prev.filter((f) => f.name !== name));

  const handleClear = () => {
    setFiles([]);
    setErrors([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Drag handlers ─────────────────────────────────────────
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  // ── Input change ──────────────────────────────────────────
  const onInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  // ── Submit ────────────────────────────────────────────────
  const handleUpload = () => {
    // Ready to wire up: `files` contains the File objects to send.
    handleClear();
  };

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FilePlus className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Add New Document</h1>
          <p className="text-xs text-gray-400 mt-0.5">Upload PDF or image files.</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
          px-6 py-12 cursor-pointer transition-colors select-none max-w-3xl
          ${dragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50"
          }`}
      >
        <div className={`p-3 rounded-full transition-colors ${dragging ? "bg-blue-100" : "bg-white border border-gray-200"}`}>
          <UploadCloud className={`w-7 h-7 ${dragging ? "text-blue-500" : "text-gray-400"}`} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Drag &amp; drop files here, or{" "}
            <span className="text-blue-600 underline underline-offset-2">click to browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Accepts PDF, JPG, PNG, WEBP &middot; Max {MAX_SIZE_MB} MB per file
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={onInputChange}
      />

      {/* Validation errors */}
      {errors.length > 0 && (
        <ul className="mt-3 space-y-1">
          {errors.map((err) => (
            <li key={err} className="text-xs text-red-500 flex items-center gap-1">
              <X className="w-3 h-3 shrink-0" /> {err}
            </li>
          ))}
        </ul>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2 max-w-3xl">
          {files.map((file) => (
            <li
              key={file.name}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-2.5 shadow-sm"
            >
              {fileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between max-w-3xl">
        <ActionButton
          label="Cancel"
          variant="secondary"
          onClick={handleClear}
          disabled={files.length === 0}
        />
        <ActionButton
          label={`Upload Document${files.length !== 1 ? "s" : ""}${files.length > 0 ? ` (${files.length})` : ""}`}
          icon={UploadCloud}
          onClick={handleUpload}
          disabled={files.length === 0}
        />
      </div>
    </div>
  );
}
