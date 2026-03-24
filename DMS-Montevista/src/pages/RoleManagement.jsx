import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";
import { ShieldPlus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import SearchBar from "../components/common/SearchBar";
import ActionButton from "../components/common/ActionButton";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import RoleFormModal from "../components/RoleManagement/RoleFormModal";
import ConfirmModal from "../components/common/ConfirmModal";
import { useToast } from "../components/common/ToastContext";

const API_BASE = "/roles";

const EMPTY_FORM = {
  role_name: "",
  description: "",
  is_active: true,
  page_ids: [],
};

export default function RoleManagement() {
  const toast = useToast();

  const [roles, setRoles]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(10);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);

  const [pages, setPages]           = useState([]);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formError, setFormError]   = useState("");
  const [saving, setSaving]         = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Fetch pages list once ─────────────────────────────────
  useEffect(() => {
    api.get(`${API_BASE}/pages`).then(({ data }) => setPages(data)).catch(() => {});
  }, []);

  // ── Fetch roles ───────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(API_BASE, { params: { search, page, limit } });
      setRoles(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);
  useEffect(() => { setPage(1); }, [search, limit]);

  // ── Helpers ──────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (role) => {
    setEditTarget(role);
    setForm({
      role_name:   role.role_name,
      description: role.description || "",
      is_active:   role.is_active,
      page_ids:    role.page_ids || [],
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setFormError(""); };

  const handleFormChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    setFormError("");
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`${API_BASE}/${editTarget.role_id}`, form);
        toast.success(`Role "${form.role_name}" has been updated.`);
      } else {
        await api.post(API_BASE, form);
        toast.success(`Role "${form.role_name}" has been created.`);
      }
      closeModal();
      fetchRoles();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`${API_BASE}/${deleteTarget.role_id}`);
      toast.success(`Role "${deleteTarget.role_name}" has been deleted.`);
      setDeleteTarget(null);
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Columns ──────────────────────────────────────────────
  const columns = [
    {
      key: "no",
      header: "#",
      className: "w-12 text-gray-400",
      render: (_, i) => (page - 1) * limit + i + 1,
    },
    { key: "role_name", header: "Role Name" },
    {
      key: "description",
      header: "Description",
      render: (row) => row.description || <span className="text-gray-300">—</span>,
    },
    {
      key: "page_ids",
      header: "Pages",
      render: (row) => {
        const count = (row.page_ids || []).length;
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
            {count} page{count !== 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      key: "is_active",
      header: "Status",
      render: (row) =>
        row.is_active ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            Inactive
          </span>
        ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row) =>
        new Date(row.created_at).toLocaleDateString("en-PH", {
          year: "numeric", month: "short", day: "numeric",
        }),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <ActionButton variant="secondary" size="sm" icon={Pencil} tooltip="Edit role" onClick={() => openEdit(row)} />
          <ActionButton variant="danger" size="sm" icon={Trash2} tooltip="Delete role" onClick={() => setDeleteTarget(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Role Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">Define roles and their page access permissions.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by role name or description…" />
        <ActionButton label="Add Role" icon={ShieldPlus} tooltip="Create a new role" onClick={openAdd} />
      </div>

      <DataTable columns={columns} data={roles} loading={loading} emptyMessage="No roles found." />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <RoleFormModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        form={form}
        onChange={handleFormChange}
        pages={pages}
        editMode={!!editTarget}
        saving={saving}
        error={formError}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Role"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">{deleteTarget?.role_name}</span>?
            This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
