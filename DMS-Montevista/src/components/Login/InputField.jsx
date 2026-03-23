// src/components/Login/InputField.jsx
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  Icon,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-800 placeholder-gray-400
            ${Icon ? "pl-9" : "px-3"}
            ${isPassword ? "pr-10" : "pr-3"}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
