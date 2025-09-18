import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";

function App() {
  return (
    <ErrorBoundary fallbackMessage="The application encountered an unexpected error. Please refresh the page or contact support if the problem persists.">
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <ErrorBoundary fallbackMessage="Login page failed to load. Please refresh and try again.">
                  <LoginPage />
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <ErrorBoundary fallbackMessage="Admin dashboard failed to load. Please refresh and try again.">
                    <AdminDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <ErrorBoundary fallbackMessage="User dashboard failed to load. Please refresh and try again.">
                    <UserDashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ErrorBoundary fallbackMessage="Login page failed to load. Please refresh and try again.">
                  <LoginPage />
                </ErrorBoundary>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
