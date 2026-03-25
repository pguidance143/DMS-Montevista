import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserRegistration from "./pages/UserRegistration";
import RoleManagement from "./pages/RoleManagement";
import PasswordManagement from "./pages/PasswordManagement";
import UserActivityLog from "./pages/UserActivityLog";
import MainLayout from "./components/Layout/MainLayout";
import AddNewDocument from "./pages/documents/AddNewDocument";
import DocumentSector from "./pages/documents/DocumentSector";
import DocumentSubsector from "./pages/documents/DocumentSubsector";
import { UserProvider } from "./components/common/UserContext";
import { ToastProvider } from "./components/common/ToastContext";

const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <ToastProvider>
    <UserProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Protected layout — all authenticated pages go here */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/usermanagement/registration"
            element={<UserRegistration />}
          />
          <Route path="/usermanagement/roles" element={<RoleManagement />} />
          <Route
            path="/usermanagement/password"
            element={<PasswordManagement />}
          />
          <Route
            path="/usermanagement/activitylog"
            element={<UserActivityLog />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/usermanagement/registration"
            element={<UserRegistration />}
          />
          <Route path="/documents/all" element={<AddNewDocument />} />
          <Route path="/documents/sector" element={<DocumentSector />} />
          <Route path="/documents/subsector" element={<DocumentSubsector />} />
        </Route>
      </Routes>
    </UserProvider>
  </ToastProvider>
);

export default App;
