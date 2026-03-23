import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "./Sidebar";
import Footer from "./Footer";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../common/UserContext";
import { menuConfig } from "../config/menuconfig";
import {
  LayoutDashboard,
  Settings,
  List,
  FolderTree,
  ClipboardList,
  PackageCheck,
  Truck,
  RefreshCcw,
  BarChart3,
  User2,
  FolderKanban,
  UserLock,
  FileText,
  PackageSearch,
  ThumbsUp,
  Share2,
  Archive,
  Building2,
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Lock,
  ScrollText,
  FilePlus,
  Layers,
  Network,
} from "lucide-react";

const ICON_MAP = {
  LayoutDashboard,
  Settings,
  List,
  FolderTree,
  ClipboardList,
  PackageCheck,
  Truck,
  RefreshCcw,
  BarChart3,
  User2,
  FolderKanban,
  UserLock,
  FileText,
  PackageSearch,
  ThumbsUp,
  Share2,
  Archive,
  Building2,
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Lock,
  ScrollText,
  FilePlus,
  Layers,
  Network,
};

const getIcon = (name) => {
  const Icon = ICON_MAP[name];
  return Icon ? <Icon /> : <List />;
};

const MainLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, canAccessPage } = useUser();

  // Add this right before the visibleMenu calculation
  console.log("=== MENU DEBUG ===");
  console.log("full user object:", user);
  console.log("allowed_pages:", user?.allowed_pages);
  console.log("permissions:", user?.permissions);
  console.log("canAccessPage('Dashboard'):", canAccessPage("Dashboard"));
  console.log(
    "canAccessPage('User Management'):",
    canAccessPage("User Management"),
  );
  console.log("canAccessPage('Inventory'):", canAccessPage("Inventory"));
  console.log("==================");
  // Filter menus — a parent is visible if it has at least one visible child
  const visibleMenu = menuConfig
    .map((item) => {
      if (!item.children) return item;

      // Filter children by page access
      const visibleChildren = item.children.filter(
        (child) => !child.page || canAccessPage(child.page),
      );

      return { ...item, children: visibleChildren };
    })
    .filter((item) => {
      // Dashboard — always show
      if (!item.children && !item.page) return true;

      // Leaf item with no children — check its own page
      if (!item.children) return !item.page || canAccessPage(item.page);

      // Parent — show only if at least one child survived the filter
      return item.children.length > 0;
    });

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded}>
        {visibleMenu.map((item) => {
          const isActive = item.path
            ? location.pathname === item.path
            : location.pathname.startsWith(item.pathPrefix || "");

          if (!item.children || item.children.length === 0) {
            return (
              <SidebarItem
                key={item.key}
                icon={getIcon(item.icon)}
                text={item.text}
                active={isActive}
                onClick={() => navigate(item.path)}
              />
            );
          }

          return (
            <SidebarItem
              key={item.key}
              icon={getIcon(item.icon)}
              text={item.text}
              active={isActive}
              pathPrefix={item.pathPrefix}
              onClick={() =>
                item.children?.[0]?.path && navigate(item.children[0].path)
              }
            >
              {item.children.map((child) => (
                <SidebarItem
                  key={child.path}
                  icon={getIcon(child.icon)}
                  text={child.text}
                  active={location.pathname.startsWith(child.path)}
                  onClick={() => navigate(child.path)}
                  isSubmenu={true}
                />
              ))}
            </SidebarItem>
          );
        })}
      </Sidebar>

      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-2 border-indigo-500 mx-auto" />
                <p className="mt-2 text-sm font-semibold text-gray-700">
                  Please wait...
                </p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
