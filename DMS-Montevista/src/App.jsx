import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserRegistration from "./pages/UserRegistration";
import MainLayout from "./components/Layout/MainLayout";
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
        <Route path="/usermanagement/registration" element={<UserRegistration />} />
      </Route>
    </Routes>
  </UserProvider>
  </ToastProvider>
);

export default App;
