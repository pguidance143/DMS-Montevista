import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import InputField from "../components/Login/InputField";
import { FaUser, FaLock } from "react-icons/fa";
import Button from "../components/Login/Button";
import { useUser } from "../components/common/UserContext";

const API_URL = "http://localhost:50000/api/v1";

const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
};

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [logincredentials, setLoginCredentials] = useState({
    username: "",
    password: "",
  });
  const [remember, setRemember] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe") === "true";
    if (remembered) {
      setLoginCredentials((prev) => ({
        ...prev,
        username: localStorage.getItem("rememberedUsername") || "",
      }));
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await axios.post(`${API_URL}/login`, {
        username: logincredentials.username,
        password: logincredentials.password,
        deviceId: getDeviceId(),
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      setUser(user);

      if (remember) {
        localStorage.setItem("rememberedUsername", logincredentials.username);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberMe");
      }

      navigate("/dashboard");
    } catch (error) {
      setHasError(true);
      setErrorMessage(
        error.response?.data?.message || "Server error. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="flex w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">

        {/* LEFT PANEL */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex-col items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />

          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            <div className="overflow-hidden flex items-center justify-center h-48 w-48">
              <img
                src="/Montevista-logo-noBG.png"
                alt="Montevista Logo"
                className="h-48 w-48 object-contain scale-[2.8] -translate-x-1"
              />
            </div>
            <div>
              <p className="text-white text-base font-bold leading-tight">
                Document Management System
              </p>
              <p className="text-blue-200 text-xs mt-1.5 font-medium">
                Municipality of Montevista
              </p>
            </div>
            <div className="w-10 h-0.5 bg-white/40 rounded-full" />
            <p className="text-blue-100 text-xs leading-relaxed max-w-xs">
              Secure, efficient, and organized document handling for local
              government operations.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-7 py-8">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <InputField
              label="Username"
              type="text"
              value={logincredentials.username}
              onChange={(e) =>
                setLoginCredentials({ ...logincredentials, username: e.target.value })
              }
              placeholder="Enter your username"
              Icon={FaUser}
            />
            <InputField
              label="Password"
              type="password"
              value={logincredentials.password}
              onChange={(e) =>
                setLoginCredentials({ ...logincredentials, password: e.target.value })
              }
              placeholder="Enter your password"
              Icon={FaLock}
            />

            <div className="flex items-center text-xs">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                Remember me
              </label>
            </div>

            {hasError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </div>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-xs text-gray-400 mt-6 text-center">
            &copy; {new Date().getFullYear()} Municipality of Montevista. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
