import { FileText, Calendar, User, Building2, Download, ExternalLink } from "lucide-react";
import Modal from "../common/Modal";
import ActionButton from "../common/ActionButton";

const Row = ({ label, value }) =>
  value ? (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-400 w-32 shrink-0">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  ) : null;

const Badge = ({ children, color = "blue" }) => (
  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-${color}-50 text-${color}-600`}>
    {children}
  </span>
);

export default function DocumentViewModal({ open, onClose, document: doc }) {
  if (!doc) return null;

  const fileUrl = doc.file_path
    ? `http://localhost:50000/uploads/${doc.file_path.split(/[/\\]/).pop()}`
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${doc.type_name || "Document"} No. ${doc.document_number}, Series of ${doc.series_year}`}
      icon={FileText}
      size="2xl"
      footer={
        <>
          {fileUrl && (
            <ActionButton
              label="View File"
              icon={ExternalLink}
              variant="secondary"
              onClick={() => window.open(fileUrl, "_blank")}
            />
          )}
          <ActionButton label="Close" variant="secondary" onClick={onClose} />
        </>
      }
    >
      <div className="space-y-4">
        {/* Title */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-500 font-medium mb-1">Title / Subject</p>
          <p className="text-sm text-gray-800 font-medium leading-relaxed">{doc.title}</p>
        </div>

        {/* Classification */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Document Details</p>
            <Row label="Type" value={doc.type_name} />
            <Row label="Number" value={doc.document_number} />
            <Row label="Series Year" value={doc.series_year} />
            <Row label="Sector" value={doc.sector_name} />
            <Row label="Subsector" value={doc.subsector_name} />
            <Row label="Status" value={doc.status} />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Session Info</p>
            <Row label="Date" value={doc.session_date ? new Date(doc.session_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null} />
            <Row label="Type" value={doc.session_type} />
            <Row label="Session No." value={doc.session_number} />
          </div>
        </div>

        {/* Signatories */}
        {(doc.author || doc.presiding_officer || doc.attested_by || doc.approved_by) && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Signatories</p>
            <div className="grid grid-cols-2 gap-2">
              <Row label="Author" value={doc.author} />
              <Row label="Presiding" value={doc.presiding_officer} />
              <Row label="Attested By" value={doc.attested_by} />
              <Row label="Approved By" value={doc.approved_by} />
            </div>
          </div>
        )}

        {/* Description */}
        {doc.description && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{doc.description}</p>
          </div>
        )}

        {/* Content preview */}
        {doc.content_text && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Content Text</p>
            <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap">
              {doc.content_text}
            </div>
          </div>
        )}

        {/* File info */}
        {doc.file_name && (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
            {doc.file_type === "application/pdf" ? (
              <FileText className="w-5 h-5 text-red-500 shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-blue-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{doc.file_name}</p>
              {doc.file_size && (
                <p className="text-xs text-gray-400">
                  {doc.file_size >= 1024 * 1024
                    ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB`
                    : `${(doc.file_size / 1024).toFixed(0)} KB`}
                </p>
              )}
            </div>
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 transition"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Upload info */}
        <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
          {doc.uploaded_by_name && <span>Uploaded by: {doc.uploaded_by_name}</span>}
          {doc.created_at && <span>Created: {new Date(doc.created_at).toLocaleString()}</span>}
          {doc.updated_at && <span>Updated: {new Date(doc.updated_at).toLocaleString()}</span>}
        </div>
      </div>
    </Modal>
  );
}
