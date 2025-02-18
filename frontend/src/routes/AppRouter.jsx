import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import PiezasPage from "../pages/PiezasPage";
import ImportarPiezasPage from "../pages/ImportarPiezasPage"; 
import CrearPiezaPage from "../pages/CrearPiezaPage"; 
import RequisicionesPage from "../pages/RequisitionScreen";
import RequisitionEditScreen from "../pages/RequisitionEditScreen";
import RequisitionHomeScreen from "../pages/RequisitionHomeScreen";
import ReportesPage from "../pages/ReportesPage";


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
    return children; // Permite acceso a todas las rutas sin verificar el token
  };

  return (
    <Routes>
      {/* Ruta de Login */}
      <Route
        path="/login"
        element={<LoginPage />} // Permite acceso al login sin redirección

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

      {/* Nueva Ruta para Importar Piezas */}
      <Route
        path="/importar-piezas"
        element={
          <PrivateRoute>
            <ImportarPiezasPage />
          </PrivateRoute>
        }
      />

      {/* Nueva Ruta para Crear Piezas */}
      <Route
        path="/nueva-pieza"
        element={
          <PrivateRoute>
            <CrearPiezaPage />
          </PrivateRoute>
        }
      />

      {/* Nueva Ruta para gestion de requisiciones */}
      <Route
        path="/gestion-requisiciones"
        element={
          <PrivateRoute>
            <RequisicionesPage />
          </PrivateRoute>
        }
      />

      {/* Nueva Ruta para editar de requisiciones */}
      <Route
        path="/editar-requisicion"
        element={
          <PrivateRoute>
            <RequisitionEditScreen />
          </PrivateRoute>
        }
      />

      {/* Nueva Ruta para home de requisiciones */}
      <Route
        path="/home-requisiciones"
        element={
          <PrivateRoute>
            <RequisitionHomeScreen />
          </PrivateRoute>
        }
      />

      {/* Nueva Ruta para reportes */}
      <Route
        path="/reportes"
        element={
          <PrivateRoute>
            <ReportesPage />
          </PrivateRoute>
        }
      />

      {/* Ruta para no encontradas */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
