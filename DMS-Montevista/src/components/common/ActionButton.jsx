const variants = {
  primary:   "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
  secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm",
  danger:    "bg-red-500 hover:bg-red-600 text-white shadow-sm",
  ghost:     "bg-transparent hover:bg-gray-100 text-gray-600",
};

const sizes = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
};

const iconOnlySizes = {
  sm: "p-1.5",
  md: "p-2",
};

const ActionButton = ({
  label,
  tooltip,
  onClick,
  variant = "primary",
  size = "md",
  icon: Icon,
  disabled = false,
  type = "button",
  className = "",
}) => {
  const btn = (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors
        ${variants[variant]} ${label ? sizes[size] : iconOnlySizes[size]}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );

  if (!tooltip) return btn;

  return (
    <div className="relative group inline-flex">
      {btn}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5
        opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
        <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
          {tooltip}
        </div>
        {/* Arrow */}
        <div className="w-2 h-2 bg-gray-800 rotate-45 mx-auto -mt-1" />
      </div>
    </div>
  );
};

export default ActionButton;
