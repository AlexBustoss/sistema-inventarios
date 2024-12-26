import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import PiezasPage from "../pages/PiezasPage";

const AppRouter = () => {
  const [token, setToken] = useState(() => localStorage.getItem("token")); // Estado inicial del token

  // Actualiza el token cuando cambie en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Componente para proteger rutas privadas
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      {/* Ruta de Login */}
      <Route
        path="/login"
        element={
          token ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Ruta del Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* Ruta de Gestión de Piezas */}
      <Route
        path="/gestion-piezas"
        element={
          <PrivateRoute>
            <PiezasPage />
          </PrivateRoute>
        }
      />

      {/* Ruta para no encontradas */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
