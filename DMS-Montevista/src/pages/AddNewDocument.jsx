import { useState, useEffect, useCallback } from "react";
import { FileText, Pencil, Trash2, Eye, FilePlus } from "lucide-react";
import api from "../api/axiosInstance";
import SearchBar from "../components/common/SearchBar";
import ActionButton from "../components/common/ActionButton";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import ConfirmModal from "../components/common/ConfirmModal";
import { useToast } from "../components/common/ToastContext";
import DocumentFormModal from "../components/Documents/DocumentFormModal";
import DocumentViewModal from "../components/Documents/DocumentViewModal";

const DOC_API = "/documents";
const SECTOR_API = "/sectors";
const SUBSECTOR_API = "/subsectors";

export default function AddNewDocument() {
  const toast = useToast();

  // ── List state ────────────────────────────────────────────
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Filter state ──────────────────────────────────────────
  const [filterType, setFilterType] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // ── Lookup data ───────────────────────────────────────────
  const [documentTypes, setDocumentTypes] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [subsectors, setSubsectors] = useState([]);
  const [seriesYears, setSeriesYears] = useState([]);

  // ── Modal state ───────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const [viewDoc, setViewDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch lookups ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [typesRes, sectorsRes, subsectorsRes, yearsRes] = await Promise.all([
          api.get(`${DOC_API}/types`),
          api.get(SECTOR_API, { params: { limit: 999 } }),
          api.get(SUBSECTOR_API, { params: { limit: 999 } }),
          api.get(`${DOC_API}/years`),
        ]);
        setDocumentTypes(typesRes.data);
        setSectors(sectorsRes.data?.data || sectorsRes.data || []);
        setSubsectors(subsectorsRes.data?.data || subsectorsRes.data || []);
        setSeriesYears(yearsRes.data || []);
      } catch {
        // silently fail
      }
    };
    load();
  }, []);

  // ── Fetch documents ───────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, page, limit };
      if (filterType) params.document_type_id = filterType;
      if (filterYear) params.series_year = filterYear;

      const { data } = await api.get(DOC_API, { params });
      setDocuments(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, filterType, filterYear]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);
  useEffect(() => { setPage(1); }, [search, limit, filterType, filterYear]);

  // ── Open add/edit ─────────────────────────────────────────
  const openAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEdit = async (row) => {
    try {
      const { data } = await api.get(`${DOC_API}/${row.document_id}`);
      setEditData(data);
      setModalOpen(true);
    } catch {
      toast.error("Failed to load document details.");
    }
  };

  const openView = async (row) => {
    try {
      const { data } = await api.get(`${DOC_API}/${row.document_id}`);
      setViewDoc(data);
    } catch {
      toast.error("Failed to load document details.");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditData(null);
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (key === "file") {
          if (val) fd.append("file", val);
        } else if (val !== "" && val !== null && val !== undefined) {
          fd.append(key, val);
        }
      });

      // Add uploaded_by from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.userId) fd.append("uploaded_by", user.userId);

      if (editData) {
        await api.put(`${DOC_API}/${editData.document_id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Document updated successfully.");
      } else {
        await api.post(DOC_API, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Document added successfully.");
      }
      closeModal();
      fetchDocuments();
      // Refresh years list
      try {
        const { data } = await api.get(`${DOC_API}/years`);
        setSeriesYears(data || []);
      } catch { /* ignore */ }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`${DOC_API}/${deleteTarget.document_id}`);
      toast.success("Document archived successfully.");
      setDeleteTarget(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Format helpers ────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // ── Table columns ────────────────────────────────────────
  const columns = [
    {
      key: "no",
      header: "#",
      className: "w-10 text-gray-400",
      render: (_, i) => (page - 1) * limit + i + 1,
    },
    {
      key: "document_number",
      header: "Doc No.",
      className: "w-20",
      render: (row) => (
        <span className="font-medium text-gray-800">{row.document_number}</span>
      ),
    },
    {
      key: "type_name",
      header: "Type",
      className: "w-28",
      render: (row) => (
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
          {row.type_name}
        </span>
      ),
    },
    {
      key: "series_year",
      header: "Series",
      className: "w-16",
    },
    {
      key: "title",
      header: "Title",
      className: "min-w-[200px]",
      render: (row) => (
        <div className="max-w-xs truncate" title={row.title}>
          {row.title}
        </div>
      ),
    },
    {
      key: "sector_name",
      header: "Sector",
      className: "w-28",
      render: (row) => row.sector_name || "—",
    },
    {
      key: "session_date",
      header: "Session Date",
      className: "w-28",
      render: (row) => formatDate(row.session_date),
    },
    {
      key: "file_name",
      header: "File",
      className: "w-16 text-center",
      render: (row) =>
        row.file_name ? (
          <FileText className="w-4 h-4 text-red-400 mx-auto" />
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (row) => (
        <div className="flex items-center gap-1">
          <ActionButton
            variant="ghost"
            size="sm"
            icon={Eye}
            tooltip="View details"
            onClick={() => openView(row)}
          />
          <ActionButton
            variant="secondary"
            size="sm"
            icon={Pencil}
            tooltip="Edit"
            onClick={() => openEdit(row)}
          />
          <ActionButton
            variant="danger"
            size="sm"
            icon={Trash2}
            tooltip="Archive"
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  const selectClass =
    "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition bg-white appearance-none";

  const hasFilters = filterType || filterYear;

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FilePlus className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Documents</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage and search uploaded documents.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="Search documents…"
          />

          {/* Type filter */}
          <select
            className={selectClass}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            {documentTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.type_name}</option>
            ))}
          </select>

          {/* Year filter */}
          <select
            className={selectClass}
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {seriesYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setFilterType(""); setFilterYear(""); }}
              className="text-xs text-blue-500 hover:text-blue-700 underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>

        <ActionButton label="Add Document" icon={FilePlus} onClick={openAdd} />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={documents}
        loading={loading}
        emptyMessage="No documents found."
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(val) => { setLimit(val); setPage(1); }}
      />

      {/* Add / Edit Modal */}
      <DocumentFormModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editData={editData}
        documentTypes={documentTypes}
        sectors={sectors}
        subsectors={subsectors}
        saving={saving}
      />

      {/* View Modal */}
      <DocumentViewModal
        open={!!viewDoc}
        onClose={() => setViewDoc(null)}
        document={viewDoc}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Archive Document"
        message={
          <>
            Are you sure you want to archive{" "}
            <span className="font-semibold text-gray-800">
              {deleteTarget?.type_name} No. {deleteTarget?.document_number}, Series of {deleteTarget?.series_year}
            </span>
            ? This document will be moved to archived.
          </>
        }
        confirmLabel={deleting ? "Archiving…" : "Archive"}
        loading={deleting}
      />
    </div>
  );
}
