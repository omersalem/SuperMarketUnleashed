import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/AuthContext";
import { handleFirebaseError, logError } from "../utils/errorHandling";
import { LoadingButton } from "../components/LoadingSpinner";

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { role } = await login(email, password);
      // Redirect based on automatically determined role
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      const handledError = handleFirebaseError(error);
      logError(handledError, {
        context: "LoginPage - handleSubmit",
        email,
      });
      setError(handledError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{
        background:
          "radial-gradient(circle, rgba(26,26,46,0.8) 0%, rgba(13,17,23,1) 70%)",
      }}
    >
      <div
        className="w-full max-w-md p-6 sm:p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">{t("login.title")}</h1>
        </div>
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium">
              {t("login.email")}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full px-3 py-3 sm:py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium"
            >
              {t("login.password")}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="w-full px-3 py-3 sm:py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="text-center text-sm text-gray-400 bg-gray-700/50 p-3 rounded-md">
            <p className="mb-1">
              🔒 <strong>Access Level:</strong>
            </p>
            <p>
              • <span className="text-blue-400">omersalem2008@gmail.com</span> →
              Admin Access
            </p>
            <p>
              • <span className="text-green-400">All other emails</span> →
              Read-Only Access
            </p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <LoadingButton
            type="submit"
            loading={loading}
            loadingText={t("login.loggingIn") || "Logging in..."}
            className="w-full py-3 sm:py-2 px-4 font-bold text-white rounded-full touch-manipulation"
            style={{
              background: "linear-gradient(to right, #007BFF, #00AFFF)",
            }}
          >
            {t("login.loginButton")}
          </LoadingButton>
        </form>
        <div className="flex justify-center space-x-4 sm:space-x-6">
          <button
            onClick={() => changeLanguage("en")}
            className="text-sm text-gray-400 hover:text-white py-2 px-3 rounded transition-colors touch-manipulation"
          >
            English
          </button>
          <button
            onClick={() => changeLanguage("ar")}
            className="text-sm text-gray-400 hover:text-white py-2 px-3 rounded transition-colors touch-manipulation"
          >
            العربية
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
