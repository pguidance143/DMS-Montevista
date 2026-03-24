import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";
import { ScrollText, Filter } from "lucide-react";
import SearchBar from "../components/common/SearchBar";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import ActionBadge from "../components/ActivityLog/ActionBadge";

const API_BASE = "/activitylog";

const formatDate = (d) =>
  new Date(d).toLocaleString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

export default function UserActivityLog() {
  const [logs, setLogs]           = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(25);
  const [search, setSearch]       = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [actions, setActions]     = useState([]);
  const [loading, setLoading]     = useState(false);

  // ── Fetch distinct actions for filter dropdown ────────────
  useEffect(() => {
    api.get(`${API_BASE}/actions`).then(({ data }) => setActions(data)).catch(() => {});
  }, []);

  // ── Fetch logs ────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(API_BASE, {
        params: { search, action_filter: actionFilter, page, limit },
      });
      setLogs(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, page, limit]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [search, actionFilter, limit]);

  // ── Columns ───────────────────────────────────────────────
  const columns = [
    {
      key: "no",
      header: "#",
      className: "w-12 text-gray-400",
      render: (_, i) => (page - 1) * limit + i + 1,
    },
    {
      key: "username",
      header: "User",
      render: (row) => (
        <div>
          <p className="text-xs font-medium text-gray-800">{row.username ?? "—"}</p>
          {row.ip_address && (
            <p className="text-[10px] text-gray-400 mt-0.5">{row.ip_address}</p>
          )}
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (row) => <ActionBadge action={row.action} />,
    },
    {
      key: "entity",
      header: "Entity",
      render: (row) => (
        <div>
          {row.entity_name ? (
            <p className="text-xs text-gray-700">{row.entity_name}</p>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
          {row.entity_type && (
            <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{row.entity_type}</p>
          )}
        </div>
      ),
    },
    {
      key: "details",
      header: "Details",
      render: (row) => (
        <p className="text-xs text-gray-500 max-w-xs truncate" title={row.details}>
          {row.details ?? "—"}
        </p>
      ),
    },
    {
      key: "created_at",
      header: "Date & Time",
      className: "w-44",
      render: (row) => (
        <p className="text-xs text-gray-500 whitespace-nowrap">{formatDate(row.created_at)}</p>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* ── Heading ── */}
      <div className="mb-5 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <ScrollText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">User Activity Log</h1>
          <p className="text-xs text-gray-400 mt-0.5">Audit trail of all user actions in the system.</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by user, action, entity, or details…"
          />
        </div>

        <div className="relative flex items-center">
          <Filter className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="pl-7 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition appearance-none"
          >
            <option value="">All Actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-400">
          {total.toLocaleString()} {total === 1 ? "entry" : "entries"} found
        </span>
        {(search || actionFilter) && (
          <button
            onClick={() => { setSearch(""); setActionFilter(""); }}
            className="text-xs text-blue-500 hover:text-blue-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <DataTable columns={columns} data={logs} loading={loading} emptyMessage="No activity logs found." />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}
