import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";
import { Pencil, Trash2, Layers } from "lucide-react";
import SearchBar from "../components/common/SearchBar";
import ActionButton from "../components/common/ActionButton";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import Modal from "../components/common/Modal";
import ConfirmModal from "../components/common/ConfirmModal";
import { useToast } from "../components/common/ToastContext";

const API_BASE = "/sectors";

export default function DocumentSector() {
  const toast = useToast();

  const [sectors, setSectors]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(10);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [name, setName]             = useState("");
  const [nameError, setNameError]   = useState("");
  const [saving, setSaving]         = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchSectors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(API_BASE, {
        params: { search, page, limit },
      });
      setSectors(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silently fail — table shows empty
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => { fetchSectors(); }, [fetchSectors]);
  useEffect(() => { setPage(1); }, [search, limit]);

  // ── Helpers ───────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setName("");
    setNameError("");
    setModalOpen(true);
  };

  const openEdit = (sector) => {
    setEditTarget(sector);
    setName(sector.sector_name);
    setNameError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNameError("");
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Sector name is required.");
      return;
    }
    setNameError("");
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`${API_BASE}/${editTarget.id}`, { sector_name: trimmed });
        toast.success(`"${trimmed}" has been updated.`);
      } else {
        await api.post(API_BASE, { sector_name: trimmed });
        toast.success(`"${trimmed}" has been added.`);
      }
      closeModal();
      fetchSectors();
    } catch (err) {
      setNameError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`${API_BASE}/${deleteTarget.id}`);
      toast.success(`"${deleteTarget.sector_name}" has been deleted.`);
      setDeleteTarget(null);
      fetchSectors();
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
    { key: "sector_name", header: "Sector Name" },
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
            tooltip="Edit sector"
            onClick={() => openEdit(row)}
          />
          <ActionButton
            variant="danger"
            size="sm"
            icon={Trash2}
            tooltip="Delete sector"
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
          <Layers className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Document Sector</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage document sectors.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <SearchBar
          value={search}
          onChange={(val) => setSearch(val)}
          placeholder="Search sectors…"
        />
        <ActionButton label="Add Sector" icon={Layers} onClick={openAdd} />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={sectors}
        loading={loading}
        emptyMessage="No sectors found."
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
        title={editTarget ? "Edit Sector" : "Add Sector"}
        icon={Layers}
        footer={
          <>
            <ActionButton label="Cancel" variant="secondary" onClick={closeModal} disabled={saving} />
            <ActionButton label={saving ? "Saving…" : "Save"} onClick={handleSave} disabled={saving} />
          </>
        }
      >
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Sector Name <span className="text-red-500">*</span>
          </label>
          <input
            className={inputClass}
            placeholder="e.g. Finance"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
          {nameError && (
            <p className="text-xs text-red-500 mt-1">{nameError}</p>
          )}
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Sector"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">{deleteTarget?.sector_name}</span>?
            This will also delete all its subsectors.
          </>
        }
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        loading={deleting}
      />
    </div>
  );
}
