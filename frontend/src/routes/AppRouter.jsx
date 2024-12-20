import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";

const AppRouter = () => {
  const [token, setToken] = useState(localStorage.getItem("token")); // Estado para el token

  // Escuchar cambios en localStorage
  useEffect(() => {
    const checkToken = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  return (
    <Routes>
      {/* Ruta de Login */}
      <Route 
        path="/login" 
        element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />

      {/* Ruta del Dashboard */}

      {/*
      <Route 
        path="/dashboard" 
        element={token ? <DashboardPage /> : <Navigate to="/login" replace />} Con validacion, temporalmente desactivada hasta que se termine el desarollo del dashboard
      />
      */}

      <Route 
        path="/dashboard" 
        element={<DashboardPage />} 
      />


      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
