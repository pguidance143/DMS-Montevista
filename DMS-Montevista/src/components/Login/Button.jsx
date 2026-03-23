// src/components/Login/Button.jsx
export default function Button({ children, onClick, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
        text-white font-semibold py-2.5 px-4 rounded-lg shadow-md shadow-blue-200
        transition-all duration-150 text-sm tracking-wide"
    >
      {children}
    </button>
  );
}
