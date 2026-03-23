const ACTION_STYLES = {
  LOGIN:          "bg-green-50 text-green-700",
  CREATE_USER:    "bg-blue-50 text-blue-700",
  UPDATE_USER:    "bg-yellow-50 text-yellow-700",
  DELETE_USER:    "bg-red-50 text-red-700",
  RESET_PASSWORD: "bg-purple-50 text-purple-700",
  CREATE_ROLE:    "bg-blue-50 text-blue-700",
  UPDATE_ROLE:    "bg-yellow-50 text-yellow-700",
  DELETE_ROLE:    "bg-red-50 text-red-700",
};

const ACTION_LABELS = {
  LOGIN:          "Login",
  CREATE_USER:    "Create User",
  UPDATE_USER:    "Update User",
  DELETE_USER:    "Delete User",
  RESET_PASSWORD: "Reset Password",
  CREATE_ROLE:    "Create Role",
  UPDATE_ROLE:    "Update Role",
  DELETE_ROLE:    "Delete Role",
};

export default function ActionBadge({ action }) {
  const style = ACTION_STYLES[action] ?? "bg-gray-100 text-gray-600";
  const label = ACTION_LABELS[action] ?? action;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
