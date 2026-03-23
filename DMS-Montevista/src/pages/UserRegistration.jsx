import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { UserPlus, Pencil, Trash2, Users } from "lucide-react";
import SearchBar from "../components/common/SearchBar";
import ActionButton from "../components/common/ActionButton";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import UserFormModal from "../components/UserManagement/UserFormModal";
import UserDeleteModal from "../components/UserManagement/UserDeleteModal";
import { useToast } from "../components/common/ToastContext";

const API_URL = "http://localhost:50000/api/v1/users";

const ROLES = [
  { id: 1, label: "Admin" },
  { id: 2, label: "Staff" },
  { id: 3, label: "Public User" },
];

const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? "—";

const EMPTY_FORM = {
  full_name: "",
  username: "",
  email: "",
  password: "",
  role_id: "",
  department_id: "",
};

export default function UserRegistration() {
  const toast = useToast();

  const [users, setUsers]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(10);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formError, setFormError]   = useState("");
  const [saving, setSaving]         = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  // ── Fetch ────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, {
        params: { search, page, limit },
      });
      setUsers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silently fail — table shows empty
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search, limit]);

  // ── Helpers ──────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setForm({
      full_name:     user.full_name,
      username:      user.username,
      email:         user.email,
      password:      "",
      role_id:       user.role_id ?? "",
      department_id: user.department_id ?? "",
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
        await axios.put(`${API_URL}/${editTarget.user_id}`, {
          full_name:     form.full_name,
          username:      form.username,
          email:         form.email,
          role_id:       form.role_id || null,
          department_id: form.department_id || null,
        });
        toast.success(`${form.full_name} has been updated successfully.`);
      } else {
        await axios.post(API_URL, {
          ...form,
          role_id:       form.role_id || null,
          department_id: form.department_id || null,
        });
        toast.success(`${form.full_name} has been registered successfully.`);
      }
      closeModal();
      fetchUsers();
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
      await axios.delete(`${API_URL}/${deleteTarget.user_id}`);
      toast.success(`${deleteTarget.full_name} has been deleted.`);
      setDeleteTarget(null);
      fetchUsers();
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
    { key: "full_name", header: "Full Name" },
    { key: "username",  header: "Username" },
    { key: "email",     header: "Email" },
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
          <ActionButton variant="secondary" size="sm" icon={Pencil} tooltip="Edit user" onClick={() => openEdit(row)} />
          <ActionButton variant="danger" size="sm" icon={Trash2} tooltip="Delete user" onClick={() => setDeleteTarget(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">User Registration</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage system users and their access roles.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, username, email…" />
        <ActionButton label="Add User" icon={UserPlus} tooltip="Register a new user" onClick={openAdd} />
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

      <UserFormModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        form={form}
        onChange={handleFormChange}
        editMode={!!editTarget}
        saving={saving}
        error={formError}
      />

      <UserDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        user={deleteTarget}
        deleting={deleting}
      />
    </div>
  );
}
