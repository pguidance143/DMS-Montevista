import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import SearchBar from "../../components/common/SearchBar";
import ActionButton from "../../components/common/ActionButton";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";

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

const LIMIT = 10;

export default function UserRegistration() {
  const [users, setUsers]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);

  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add mode
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
        params: { search, page, limit: LIMIT },
      });
      setUsers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silently fail — table shows empty
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [search]);

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

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // ── Save (Add / Edit) ────────────────────────────────────
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
      } else {
        await axios.post(API_URL, {
          ...form,
          role_id:       form.role_id || null,
          department_id: form.department_id || null,
        });
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
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Table columns ────────────────────────────────────────
  const columns = [
    {
      key: "no",
      header: "#",
      className: "w-12 text-gray-400",
      render: (_, i) => (page - 1) * LIMIT + i + 1,
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
          <ActionButton
            variant="secondary"
            size="sm"
            icon={Pencil}
            label="Edit"
            onClick={() => openEdit(row)}
          />
          <ActionButton
            variant="danger"
            size="sm"
            icon={Trash2}
            label="Delete"
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  // ── Field component ──────────────────────────────────────
  const Field = ({ label, children, required }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition bg-white";

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-800">User Registration</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage system users and their access roles.</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, username, email…"
        />
        <ActionButton
          label="Add User"
          icon={UserPlus}
          onClick={openAdd}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found."
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={LIMIT}
        onPageChange={setPage}
      />

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editTarget ? "Edit User" : "Add New User"}
        footer={
          <>
            <ActionButton label="Cancel" variant="secondary" onClick={closeModal} disabled={saving} />
            <ActionButton label={saving ? "Saving…" : "Save"} onClick={handleSave} disabled={saving} />
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Full Name" required>
            <input
              className={inputClass}
              placeholder="e.g. Juan Dela Cruz"
              value={form.full_name}
              onChange={field("full_name")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Username" required>
              <input
                className={inputClass}
                placeholder="e.g. jdelacruz"
                value={form.username}
                onChange={field("username")}
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                className={inputClass}
                placeholder="e.g. juan@gov.ph"
                value={form.email}
                onChange={field("email")}
              />
            </Field>
          </div>

          {!editTarget && (
            <Field label="Password" required>
              <input
                type="password"
                className={inputClass}
                placeholder="Set initial password"
                value={form.password}
                onChange={field("password")}
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <select
                className={inputClass}
                value={form.role_id}
                onChange={field("role_id")}
              >
                <option value="">— Select role —</option>
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Department ID">
              <input
                type="number"
                className={inputClass}
                placeholder="Optional"
                value={form.department_id}
                onChange={field("department_id")}
              />
            </Field>
          </div>

          {formError && (
            <p className="text-xs text-red-500 pt-1">{formError}</p>
          )}
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        size="sm"
        footer={
          <>
            <ActionButton label="Cancel" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting} />
            <ActionButton label={deleting ? "Deleting…" : "Delete"} variant="danger" onClick={handleDelete} disabled={deleting} />
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-800">{deleteTarget?.full_name}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
