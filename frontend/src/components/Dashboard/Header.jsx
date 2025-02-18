import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/header.css"; // Importar estilos

const Header = ({ title, showBackButton = false, backPath = "/dashboard" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Obtener el nombre del usuario desde localStorage
  const userName = localStorage.getItem("userName") || "Usuario";
  const userInitial = userName.charAt(0).toUpperCase(); // Inicial del usuario

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login"); // Redirige a la página de inicio de sesión
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        {/* Botón de regresar (si está activado) */}
        {showBackButton && (
          <button className="back-button" onClick={() => navigate(backPath)}>
            ← Regresar
          </button>
        )}

        {/* Logo y título */}
        <div className="header-main">
          <img
            src="/assets/images/CODETEC.png"
            alt="Codetec Logo"
            className="header-logo"
          />
          <h1 className="dashboard-title">{title}</h1>
        </div>

        {/* Contenedor del avatar del usuario */}
        <div
          className="user-avatar-container"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="user-initials">{userInitial}</span>
          {isMenuOpen && (
            <div className="user-menu">
              <p className="user-name">{userName}</p>
              <button className="logout-button" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
