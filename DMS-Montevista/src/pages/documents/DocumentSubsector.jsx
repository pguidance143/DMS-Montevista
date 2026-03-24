import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Pencil, Trash2, Network } from "lucide-react";
import SearchBar from "../../components/common/SearchBar";
import ActionButton from "../../components/common/ActionButton";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useToast } from "../../components/common/ToastContext";

const API_URL          = "http://localhost:50000/api/v1/subsectors";
const SECTORS_API_URL  = "http://localhost:50000/api/v1/sectors";

export default function DocumentSubsector() {
  const toast = useToast();

  const [subsectors, setSubsectors] = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(10);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);

  const [sectorOptions, setSectorOptions] = useState([]);

  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [name, setName]               = useState("");
  const [nameError, setNameError]     = useState("");
  const [sectorId, setSectorId]       = useState("");
  const [sectorError, setSectorError] = useState("");
  const [saving, setSaving]           = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Fetch sector options for dropdown ────────────────────
  useEffect(() => {
    axios
      .get(SECTORS_API_URL, { params: { limit: 200 } })
      .then(({ data }) => setSectorOptions(data.data))
      .catch(() => {});
  }, []);

  // ── Fetch subsectors ──────────────────────────────────────
  const fetchSubsectors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, {
        params: { search, page, limit },
      });
      setSubsectors(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silently fail — table shows empty
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => { fetchSubsectors(); }, [fetchSubsectors]);
  useEffect(() => { setPage(1); }, [search, limit]);

  // ── Helpers ───────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setName("");
    setNameError("");
    setSectorId("");
    setSectorError("");
    setModalOpen(true);
  };

  const openEdit = (subsector) => {
    setEditTarget(subsector);
    setName(subsector.subsector_name);
    setNameError("");
    setSectorId(subsector.sector_id ?? "");
    setSectorError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNameError("");
    setSectorError("");
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    const trimmed = name.trim();
    let hasError = false;

    if (!trimmed) { setNameError("Subsector name is required."); hasError = true; }
    if (!sectorId) { setSectorError("Sector is required."); hasError = true; }
    if (hasError) return;

    setNameError("");
    setSectorError("");
    setSaving(true);
    try {
      if (editTarget) {
        await axios.put(`${API_URL}/${editTarget.id}`, {
          subsector_name: trimmed,
          sector_id: Number(sectorId),
        });
        toast.success(`"${trimmed}" has been updated.`);
      } else {
        await axios.post(API_URL, {
          subsector_name: trimmed,
          sector_id: Number(sectorId),
        });
        toast.success(`"${trimmed}" has been added.`);
      }
      closeModal();
      fetchSubsectors();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      if (msg.toLowerCase().includes("sector")) {
        setSectorError(msg);
      } else {
        setNameError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.subsector_name}" has been deleted.`);
      setDeleteTarget(null);
      fetchSubsectors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────
  const columns = [
    {
      key: "no",
      header: "#",
      className: "w-12 text-gray-400",
      render: (_, i) => (page - 1) * limit + i + 1,
    },
    { key: "subsector_name", header: "Subsector Name" },
    {
      key: "sector_name",
      header: "Sector",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {row.sector_name ?? "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <ActionButton
            variant="secondary"
            size="sm"
            icon={Pencil}
            tooltip="Edit subsector"
            onClick={() => openEdit(row)}
          />
          <ActionButton
            variant="danger"
            size="sm"
            icon={Trash2}
            tooltip="Delete subsector"
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition bg-white";

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Network className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Document Subsector</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage document subsectors.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <SearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder="Search subsectors or sectors…"
        />
        <ActionButton label="Add Subsector" icon={Network} onClick={openAdd} />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={subsectors}
        loading={loading}
        emptyMessage="No subsectors found."
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
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editTarget ? "Edit Subsector" : "Add Subsector"}
        icon={Network}
        footer={
          <>
            <ActionButton label="Cancel" variant="secondary" onClick={closeModal} disabled={saving} />
            <ActionButton label={saving ? "Saving…" : "Save"} onClick={handleSave} disabled={saving} />
          </>
        }
      >
        <div className="space-y-3">
          {/* Sector dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Sector <span className="text-red-500">*</span>
            </label>
            <select
              className={inputClass}
              value={sectorId}
              onChange={(e) => { setSectorId(e.target.value); setSectorError(""); }}
            >
              <option value="">— Select sector —</option>
              {sectorOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.sector_name}</option>
              ))}
            </select>
            {sectorError && (
              <p className="text-xs text-red-500 mt-1">{sectorError}</p>
            )}
          </div>

          {/* Subsector name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Subsector Name <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Budget Planning"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            {nameError && (
              <p className="text-xs text-red-500 mt-1">{nameError}</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Subsector"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">{deleteTarget?.subsector_name}</span>?
            This action cannot be undone.
          </>
        }
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        loading={deleting}
      />
    </div>
  );
}
