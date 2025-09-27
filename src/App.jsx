import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import { PageLoadingSpinner } from "./components/LoadingSpinner";

const App = () => {
  const { currentUser, userRole, loading } = useContext(AuthContext);

  if (loading) {
    return <PageLoadingSpinner message="Authenticating..." />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={
            currentUser ? (
              userRole === "admin" ? (
                <AdminDashboard />
              ) : (
                <UserDashboard />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
