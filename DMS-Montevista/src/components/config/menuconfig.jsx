// src/components/config/menuconfig.jsx
//
// IMPORTANT: "page" on a PARENT item is ignored for visibility.
// A parent shows if ANY of its children are visible.
// Only LEAF items (children) use "page" for access control.
// page: null = always visible (Dashboard)

export const menuConfig = [
  {
    key: "dashboard",
    text: "Dashboard",
    icon: "LayoutDashboard",
    path: "/dashboard",
    page: null, // always visible
  },

  // ── Documents ───────────────────────────────────────────
  {
    key: "documents",
    text: "Documents",
    icon: "FileText",
    pathPrefix: "/documents",
    page: null,
    children: [
      {
        text: "My Documents",
        path: "/documents/mine",
        icon: "FolderKanban",
        page: "Documents",
      },
      {
        text: "Shared with Me",
        path: "/documents/shared",
        icon: "Share2",
        page: "Documents",
      },
      {
        text: "All Documents",
        path: "/documents/all",
        icon: "List",
        page: "All Documents",
      },
      {
        text: "Archived",
        path: "/documents/archived",
        icon: "Archive",
        page: "Documents",
      },
    ],
  },

  // ── Document Tracking ────────────────────────────────────
  {
    key: "tracking",
    text: "Document Tracking",
    icon: "ClipboardList",
    pathPrefix: "/tracking",
    page: null,
    children: [
      {
        text: "Incoming",
        path: "/tracking/incoming",
        icon: "PackageCheck",
        page: "Document Tracking",
      },
      {
        text: "Outgoing",
        path: "/tracking/outgoing",
        icon: "Truck",
        page: "Document Tracking",
      },
      {
        text: "For Action",
        path: "/tracking/foraction",
        icon: "ClipboardList",
        page: "Document Tracking",
      },
    ],
  },

  // ── Approval ────────────────────────────────────────────
  {
    key: "approval",
    text: "Approval",
    icon: "ThumbsUp",
    pathPrefix: "/approval",
    page: null,
    children: [
      {
        text: "Pending Approval",
        path: "/approval/pending",
        icon: "ClipboardList",
        page: "Approval",
      },
      {
        text: "Approved",
        path: "/approval/approved",
        icon: "PackageCheck",
        page: "Approval",
      },
      {
        text: "Returned",
        path: "/approval/returned",
        icon: "RefreshCcw",
        page: "Approval",
      },
    ],
  },

  // ── User Management ─────────────────────────────────────
  {
    key: "usermanagement",
    text: "User Management",
    icon: "Users",
    pathPrefix: "/usermanagement",
    page: null,
    children: [
      {
        text: "User Registration",
        path: "/usermanagement/registration",
        icon: "UserPlus",
        page: "User Management",
      },
      {
        text: "Login / Authentication",
        path: "/usermanagement/authentication",
        icon: "KeyRound",
        page: "User Management",
      },
      {
        text: "Role Management",
        path: "/usermanagement/roles",
        icon: "ShieldCheck",
        page: "User Management",
      },
      {
        text: "Password Management",
        path: "/usermanagement/password",
        icon: "Lock",
        page: "User Management",
      },
      {
        text: "User Activity Log",
        path: "/usermanagement/activitylog",
        icon: "ScrollText",
        page: "User Management",
      },
    ],
  },

  // ── Administration ──────────────────────────────────────
  {
    key: "administration",
    text: "Administration",
    icon: "Settings",
    pathPrefix: "/administration",
    page: null,
    children: [
      {
        text: "Departments",
        path: "/administration/departments",
        icon: "Building2",
        page: "System Settings",
      },
      {
        text: "Document Categories",
        path: "/administration/categories",
        icon: "FolderTree",
        page: "System Settings",
      },
    ],
  },

  // ── Reports ─────────────────────────────────────────────
  {
    key: "reports",
    text: "Reports",
    icon: "BarChart3",
    pathPrefix: "/reports",
    page: null,
    children: [
      {
        text: "Activity Logs",
        path: "/reports/activity",
        icon: "List",
        page: "Reports",
      },
      {
        text: "Audit Reports",
        path: "/reports/audit",
        icon: "PackageSearch",
        page: "Audit Reports",
      },
      {
        text: "Document Summary",
        path: "/reports/summary",
        icon: "FileText",
        page: "Reports",
      },
    ],
  },
];
