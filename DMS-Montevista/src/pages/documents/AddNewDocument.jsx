import { useState, useRef, useCallback } from "react";
import { FilePlus, FileText, Image, X, UploadCloud, Trash2, Eye } from "lucide-react";
import ActionButton from "../../components/common/ActionButton";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable from "../../components/common/DataTable";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";

// ── Constants ────────────────────────────────────────────────
const MAX_SIZE_MB = 10;
const ACCEPT_ATTR = ".pdf,image/*";

const formatSize = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

// ── Mock seed data ───────────────────────────────────────────
let nextId = 9;
const SEED_DOCUMENTS = [
  { id: 1, name: "Project_Charter.pdf",        type: "PDF",   size: "1.2 MB",  uploadedAt: "2025-03-01" },
  { id: 2, name: "Site_Map_v2.png",             type: "Image", size: "845 KB",  uploadedAt: "2025-03-04" },
  { id: 3, name: "Environmental_Report.pdf",    type: "PDF",   size: "3.7 MB",  uploadedAt: "2025-03-07" },
  { id: 4, name: "Floor_Plan_Building_A.jpg",   type: "Image", size: "2.1 MB",  uploadedAt: "2025-03-10" },
  { id: 5, name: "Permit_Application.pdf",      type: "PDF",   size: "512 KB",  uploadedAt: "2025-03-12" },
  { id: 6, name: "Survey_Photo_01.webp",        type: "Image", size: "674 KB",  uploadedAt: "2025-03-15" },
  { id: 7, name: "Compliance_Checklist.pdf",    type: "PDF",   size: "290 KB",  uploadedAt: "2025-03-18" },
  { id: 8, name: "Aerial_Overview.png",         type: "Image", size: "4.3 MB",  uploadedAt: "2025-03-20" },
];

// ── Helpers ───────────────────────────────────────────────────
const fileIsAccepted = (file) =>
  file.type === "application/pdf" || file.type.startsWith("image/");

const typeFromFile = (file) =>
  file.type === "application/pdf" ? "PDF" : "Image";

const today = () => new Date().toISOString().slice(0, 10);

// ── Component ─────────────────────────────────────────────────
export default function AddNewDocument() {
  // List state
  const [documents, setDocuments] = useState(SEED_DOCUMENTS);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(10);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null); // document object

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [files, setFiles]         = useState([]);
  const [dragging, setDragging]   = useState(false);
  const [errors, setErrors]       = useState([]);
  const inputRef                  = useRef(null);

  // ── File helpers (modal) ────────────────────────────────────
  const addFiles = useCallback((incoming) => {
    const newErrors = [];
    const toAdd = [];
    Array.from(incoming).forEach((file) => {
      if (!fileIsAccepted(file)) {
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
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...toAdd.filter((f) => !existing.has(f.name))];
    });
  }, []);

  const removeFile = (name) =>
    setFiles((prev) => prev.filter((f) => f.name !== name));

  const clearModal = () => {
    setFiles([]);
    setErrors([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const closeModal = () => { clearModal(); setModalOpen(false); };

  // ── Drag handlers ───────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); };
  const onInputChange = (e) => { addFiles(e.target.files); e.target.value = ""; };

  // ── Upload (client-side only) ───────────────────────────────
  const handleUpload = () => {
    const newDocs = files.map((file) => ({
      id:         nextId++,
      name:       file.name,
      type:       typeFromFile(file),
      size:       formatSize(file.size),
      uploadedAt: today(),
    }));
    setDocuments((prev) => [...newDocs, ...prev]);
    closeModal();
  };

  // ── Delete (client-side) ────────────────────────────────────
  const confirmDelete = () => {
    setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ── Filtered + paginated list ───────────────────────────────
  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage   = Math.min(page, totalPages);
  const pageData   = filtered.slice((safePage - 1) * limit, safePage * limit);

  // ── Table columns ───────────────────────────────────────────
  const columns = [
    {
      key: "name",
      header: "Document Name",
      render: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          {row.type === "PDF"
            ? <FileText className="w-4 h-4 text-red-500 shrink-0" />
            : <Image    className="w-4 h-4 text-blue-500 shrink-0" />}
          <span className="truncate max-w-xs">{row.name}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
          ${row.type === "PDF"
            ? "bg-red-50 text-red-600"
            : "bg-blue-50 text-blue-600"}`}>
          {row.type}
        </span>
      ),
    },
    { key: "size",       header: "Size" },
    { key: "uploadedAt", header: "Uploaded" },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <ActionButton
            variant="secondary"
            size="sm"
            icon={Eye}
            tooltip="View document"
            onClick={() => {}}
          />
          <ActionButton
            variant="danger"
            size="sm"
            icon={Trash2}
            tooltip="Delete document"
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FilePlus className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Documents</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage uploaded PDF and image files.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search documents..."
        />
        <ActionButton
          label="Add Document"
          icon={FilePlus}
          onClick={() => setModalOpen(true)}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={pageData}
        emptyMessage="No documents found."
      />

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          page={safePage}
          totalPages={totalPages}
          limit={limit}
          total={filtered.length}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
        />
      </div>

      {/* Add Document Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Add New Document"
        icon={FilePlus}
        size="xl"
        footer={
          <>
            <ActionButton
              label="Cancel"
              variant="secondary"
              onClick={closeModal}
            />
            <ActionButton
              label={`Upload Document${files.length !== 1 ? "s" : ""}${files.length > 0 ? ` (${files.length})` : ""}`}
              icon={UploadCloud}
              onClick={handleUpload}
              disabled={files.length === 0}
            />
          </>
        }
      >
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
            px-6 py-10 cursor-pointer transition-colors select-none
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

        {/* Staged file list */}
        {files.length > 0 && (
          <ul className="mt-4 space-y-2">
            {files.map((file) => (
              <li
                key={file.name}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-2.5 shadow-sm"
              >
                {file.type === "application/pdf"
                  ? <FileText className="w-5 h-5 text-red-500 shrink-0" />
                  : <Image    className="w-5 h-5 text-blue-500 shrink-0" />}
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
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
