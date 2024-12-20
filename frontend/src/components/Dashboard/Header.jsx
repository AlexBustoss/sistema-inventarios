import React from "react";
import "../../styles/header.css";
import userAvatar from "/assets/images/user-avatar.png"; // Imagen de avatar

const Header = () => {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <img
          src="/assets/images/CODETEC.png"
          alt="Codetec Logo"
          className="header-logo"
        />
        <h1 className="dashboard-title">Sistema de Gestión de Inventarios</h1>
        {/* Contenedor del avatar del usuario */}
<div className="user-avatar-container">
<span className="user-initials">A</span>
</div>
      </div>
    </header>
  );
};

export default Header;


