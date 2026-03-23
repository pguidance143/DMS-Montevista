import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";
import { KeyRound, Clock } from "lucide-react";
import SearchBar from "../components/common/SearchBar";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import ActionButton from "../components/common/ActionButton";
import PasswordResetModal from "../components/PasswordManagement/PasswordResetModal";
import { useToast } from "../components/common/ToastContext";

const API_BASE = "/users";

const ROLES = [
  { id: 1, label: "Admin" },
  { id: 2, label: "Staff" },
  { id: 3, label: "Public User" },
];
const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? "—";

const EMPTY_FORM = { password: "", confirm_password: "" };

const timeAgo = (dateStr) => {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
};

export default function PasswordManagement() {
  const toast = useToast();

  const [users, setUsers]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(10);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formError, setFormError]     = useState("");
  const [saving, setSaving]           = useState(false);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(API_BASE, { params: { search, page, limit } });
      setUsers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, limit]);

  // ── Open reset modal ──────────────────────────────────────
  const openReset = (user) => {
    setResetTarget(user);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const closeModal = () => { setResetTarget(null); setFormError(""); };

  const handleFormChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    setFormError("");
    setSaving(true);
    try {
      await api.patch(`${API_BASE}/${resetTarget.user_id}/password`, form);
      toast.success(`Password for ${resetTarget.full_name} has been reset.`);
      closeModal();
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
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
    { key: "full_name", header: "Full Name" },
    { key: "username",  header: "Username" },
    {
      key: "role_id",
      header: "Role",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {roleLabel(row.role_id)}
        </span>
      ),
    },
    {
      key: "updated_at",
      header: "Last Password Change",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
          <span>{timeAgo(row.updated_at)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-28",
      render: (row) => (
        <ActionButton
          variant="secondary"
          size="sm"
          icon={KeyRound}
          tooltip="Reset password"
          onClick={() => openReset(row)}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <KeyRound className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Password Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">Reset user passwords and monitor last password changes.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, username…" />
      </div>

      <DataTable columns={columns} data={users} loading={loading} emptyMessage="No users found." />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <PasswordResetModal
        open={!!resetTarget}
        onClose={closeModal}
        onSave={handleSave}
        user={resetTarget}
        form={form}
        onChange={handleFormChange}
        saving={saving}
        error={formError}
      />
    </div>
  );
}
