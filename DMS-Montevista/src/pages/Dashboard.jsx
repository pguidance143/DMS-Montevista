import { useUser } from "../components/common/UserContext";

const Dashboard = () => {
  const { user } = useUser();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">
        Welcome back,{" "}
        <span className="font-medium text-blue-600">
          {user?.fullName || user?.username || "User"}
        </span>
        .
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: "—", color: "blue" },
          { label: "Pending Approval", value: "—", color: "yellow" },
          { label: "Incoming Today", value: "—", color: "green" },
          { label: "Archived", value: "—", color: "gray" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className={`text-3xl font-bold text-${color}-500`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
