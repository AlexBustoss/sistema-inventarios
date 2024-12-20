import React from "react";
import LoginForm from "../components/Form/LoginForm";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      const response = await authService.login(data);
      localStorage.setItem("token", response.token); // Guardar el token en LocalStorage
      navigate("/dashboard"); // Redirigir al Dashboard
    } catch (error) {
      alert("Error: Correo o contraseña incorrectos");
      console.error("Error en el Login:", error.message);
    }
  };

  return (
    <div>
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
};

export default LoginPage;
