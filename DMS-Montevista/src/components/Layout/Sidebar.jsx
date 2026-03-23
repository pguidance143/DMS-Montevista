import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  ChevronFirst,
  ChevronLast,
  MoreVertical,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../common/UserContext"; // Assuming this path is correct
import AccountSettingsModal from "./AccountSettingsModal"; // Assuming this path is correct
import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";

const SideBarContext = createContext();
export default function Sidebar({ children, expanded, setExpanded }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaQueryChange = (e) => setExpanded(!e.matches);
    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate("/login");
  };

  return (
    <motion.aside
      initial={{ width: 56 }}
      animate={{ width: expanded ? 224 : 56 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-white shadow-sm border-r border-gray-200 isolate z-40 flex flex-col"
    >
      {/* --- Header --- */}
      <div className="p-3 flex justify-between items-center flex-shrink-0">
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            {/* Logo */}

            {/* Brand Name */}
            <h1 className="text-1xl font-extrabold text-gray-800">
              <span className="text-blue-600">DMS</span>
              <span className="text-gray-900"> Montevista</span>
            </h1>
          </motion.div>
        )}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"
          aria-label="Toggle Sidebar"
        >
          {expanded ? (
            <ChevronFirst className="w-4 h-4" />
          ) : (
            <ChevronLast className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="border-t border-gray-100 mx-3" />

      {/* --- Scrollable Menu Area --- */}
      <SideBarContext.Provider value={{ expanded }}>
        <div className="flex-1 overflow-y-auto px-2 py-2 custom-scroll">
          <ul className="space-y-1">{children}</ul>
        </div>
      </SideBarContext.Provider>

      {/* --- Fixed User Profile Section --- */}
      <div className="border-t border-gray-100 p-3 relative user-menu-container flex-shrink-0">
        <div className="flex items-center">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="relative cursor-pointer"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm"
            >
              {user?.initials || "NA"}
            </motion.div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </motion.div>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-3 flex-1 min-w-0"
            >
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.username || "Guest"}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email || "No Email"}
              </div>
            </motion.div>
          )}

          {expanded && (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`absolute bottom-full mb-2 ${
                expanded ? "right-3" : "left-full ml-2"
              } bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[180px]`}
            >
              <button
                onClick={() => {
                  setShowModal(true);
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 mr-3" />
                Account Settings
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AccountSettingsModal
          showModal={showModal}
          setShowModal={setShowModal}
          user={user}
        />
      </div>
    </motion.aside>
  );
}

// Tooltip component using React Portal
const Tooltip = ({ children, targetRef }) => {
  const tooltipRef = useRef();
  const [style, setStyle] = useState({});

  useEffect(() => {
    const target = targetRef.current;
    const tooltip = tooltipRef.current;
    if (target && tooltip) {
      const rect = target.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.top + rect.height / 2 - tooltip.offsetHeight / 2,
        left: rect.right + 8,
      });
    }
  }, [targetRef]);

  if (!targetRef.current) return null;

  return ReactDOM.createPortal(
    <div
      ref={tooltipRef}
      style={style}
      className="z-[9999] bg-gray-900 text-white text-xs px-2 py-1 rounded-md shadow-md whitespace-nowrap"
    >
      {children}
    </div>,
    document.body,
  );
};

// Sidebar Item with submenu logic and tooltip
export function SidebarItem({
  icon,
  text,
  active,
  alert,
  onClick,
  children, // Submenus passed here
  isSubmenu = false,
  pathPrefix = "",
}) {
  const { expanded } = useContext(SideBarContext);
  const itemRef = useRef();
  const [showTooltip, setShowTooltip] = useState(false);
  const hasSubmenus = React.Children.count(children) > 0;

  // State to control the submenu open/close
  const [isOpen, setIsOpen] = useState(active && hasSubmenus);

  const location = useLocation();

  // Effect to automatically open the parent if a child route is active
  useEffect(() => {
    if (hasSubmenus && pathPrefix && location.pathname.startsWith(pathPrefix)) {
      setIsOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Handle main item click: toggle submenu or navigate
  const handleItemClick = (e) => {
    const shouldToggleSubmenu = expanded && hasSubmenus;

    if (shouldToggleSubmenu) {
      // 1. If sidebar is expanded AND we have submenus, we TOGGLE the submenu.
      e.stopPropagation();
      setIsOpen((prev) => !prev);
    } else if (onClick) {
      // 2. Otherwise (sidebar is collapsed OR it's a regular/submenu item), we execute the onClick action.
      onClick(e);
    }
  };

  // Determine styles based on submenu or regular item
  const itemClasses = `relative flex items-center py-2 rounded-lg font-medium cursor-pointer transition-all group
  ${isSubmenu ? "pl-7 pr-2 text-sm" : "px-2"}
  ${
    isSubmenu
      ? active
        ? "text-blue-700 font-semibold" // 🔵 Only text color changes when active
        : "text-gray-600 hover:text-blue-600" // Default submenu color
      : active
        ? "bg-blue-50 text-blue-700 border border-blue-100" // Regular item (main menu)
        : "hover:bg-gray-50 text-gray-600 hover:text-gray-800"
  }`;

  const iconSize = isSubmenu ? 16 : 18;

  return (
    <>
      <motion.li
        ref={itemRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleItemClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={itemClasses}
      >
        <div className="relative flex-shrink-0">
          {React.cloneElement(icon, {
            className: `${icon.props.className || ""} ${
              active ? "scale-105" : ""
            } transition-transform`,
            size: iconSize,
          })}
          {alert && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
          )}
        </div>

        <motion.span
          initial={false}
          animate={{
            opacity: expanded ? 1 : 0,
            x: expanded ? 0 : -10,
          }}
          transition={{ duration: 0.2 }}
          className={`ml-2.5 text-sm whitespace-nowrap flex-1 ${
            expanded ? "" : "w-0 overflow-hidden"
          }`}
        >
          {text}
        </motion.span>

        {/* Submenu Indicator (only visible when expanded) */}
        {expanded && hasSubmenus && (
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto text-gray-400"
          >
            <ChevronDown size={14} />
          </motion.div>
        )}
      </motion.li>

      {/* Submenu List Rendering */}
      {hasSubmenus && (
        <>
          {/* 1. Animated and Visible when Expanded */}
          {expanded && (
            <AnimatePresence>
              {isOpen && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="ml-3 mt-1 overflow-hidden space-y-1"
                >
                  {children}
                </motion.ul>
              )}
            </AnimatePresence>
          )}

          {/* 2. Rendered but Hidden when Collapsed (for Tooltip Fix) */}
          {!expanded && (
            <ul className="absolute top-0 left-full ml-1 p-2 bg-white border rounded-lg shadow-lg hidden">
              {children}
            </ul>
          )}
        </>
      )}

      {/* Tooltip for unexpanded state (Now works for submenus too) */}
      {!expanded && showTooltip && (
        <Tooltip targetRef={itemRef}>{text}</Tooltip>
      )}
    </>
  );
}
