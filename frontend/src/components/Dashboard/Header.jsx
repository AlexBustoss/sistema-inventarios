import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/header.css";

const Header = ({ title }) => { // Recibimos el prop "title"
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Obtener el nombre del usuario desde localStorage
  const userName = localStorage.getItem("userName") || "Usuario";
  const userInitial = userName.charAt(0).toUpperCase(); // Inicial del usuario

  const handleLogout = () => {
    // Elimina token y datos de usuario almacenados
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login"); // Redirige a la página de inicio de sesión
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <img
          src="/assets/images/CODETEC.png"
          alt="Codetec Logo"
          className="header-logo"
        />
        <h1 className="dashboard-title">{title}</h1> {/* Título dinámico */}
        {/* Contenedor del avatar del usuario */}
        <div
          className="user-avatar-container"
          onClick={() => setIsMenuOpen(!isMenuOpen)} // Cambia el estado del menú al hacer clic
        >
          <span className="user-initials">{userInitial}</span>
          {isMenuOpen && (
            <div className="user-menu">
              <p className="user-name">{userName}</p>
              <button
                className="logout-button"
                onClick={handleLogout}
              >
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
