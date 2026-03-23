import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto px-6 py-4 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between">
      <span>
        &copy; {new Date().getFullYear()} Municipality of Montevista. All
        rights reserved.
      </span>
      <div className="flex space-x-4 mt-2 md:mt-0">
        <a href="#" className="hover:text-gray-700 transition">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-gray-700 transition">
          Terms of Service
        </a>
        <a href="#" className="hover:text-gray-700 transition">
          Contact
        </a>
      </div>
    </footer>
  );
};

export default Footer;
