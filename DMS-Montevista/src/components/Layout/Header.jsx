import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { useLocation } from "react-router-dom";
export default function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef();

  const location = useLocation();

  // Map paths to titles
  // const titles = {
  //   "/dashboard": "Dashboard",
  //   "/my-documents": "Documents",
  //   "/users": "Users",
  //   "/inventory": "Inventory",
  //   // add more paths if needed
  // };

  // Get title for current path or fallback
  // const title = titles[location.pathname.toLowerCase()] || "App";

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-2 bg-white shadow-md">
      <h1 className="text-xl font-semibold text-gray-700"></h1>

      <div ref={profileRef} className="relative">
        <button
          onClick={() => setProfileOpen((open) => !open)}
          className="flex items-center focus:outline-none rounded-full hover:bg-gray-100 p-1 transition"
          aria-label="Toggle profile menu"
        >
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
              alt="User Avatar"
              className="w-8 h-8 rounded-full shadow-md"
            />
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 block w-2 h-2 rounded-full ring-1 ring-white bg-green-500" />
          </div>
          <MoreVertical size={20} className="ml-2 text-gray-600" />
        </button>

        {profileOpen && (
          <div
            className="absolute right-0 mt-3 w-48 bg-white rounded-lg
      border border-gray-200
      shadow-sm
      ring-1 ring-gray-100
      backdrop-blur-sm
      animate-fadeIn
      z-50"
            style={{ animationDuration: "200ms" }}
          >
            <button className="block w-full text-left px-4 py-2 text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-t-lg transition">
              Profile Settings
            </button>
            <button className="block w-full text-left px-4 py-2 text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-600 rounded-b-lg transition">
              Logout
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation-name: fadeIn;
          animation-fill-mode: forwards;
          animation-timing-function: ease-out;
        }
      `}</style>
    </header>
  );
}
