import React from "react";
import { useForm } from "react-hook-form"; // Hook para manejar formularios
import authService from "../../services/authService"; // Servicio para manejar la autenticación
import "../../styles/global.css"; // Estilos globales
import { useNavigate } from "react-router-dom"; // Hook para redirigir a otras rutas

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm(); // Manejo del formulario con validaciones
  const navigate = useNavigate(); // Hook para redirigir al Dashboard

  /**
   * Función que se ejecuta al enviar el formulario.
   * @param {object} data - Datos del formulario.
   */
  const onSubmit = async (data) => {
    console.log("Datos del formulario:", data); // Debug: mostrar los datos enviados

    const { Email, Password } = data; // Extraer datos del formulario
    try {
      console.log("Enviando solicitud al servidor...");
      const response = await authService.login(Email, Password); // Realizar la llamada al backend
      console.log("Login exitoso:", response);

      // Mostrar alerta de confirmación
      alert("Login exitoso");

      // Verificar si el token se guardó correctamente en localStorage
      const token = localStorage.getItem("token");
      if (token) {
        console.log("Token guardado:", token);
        // Forzar sincronización con AppRouter
        window.dispatchEvent(new Event("storage")); // Disparar evento de almacenamiento para AppRouter
        navigate("/dashboard"); // Redirigir al Dashboard
      } else {
        throw new Error("No se guardó el token en localStorage");
      }
    } catch (error) {
      console.error("Error en el login:", error.message); // Manejo de errores
      alert("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo de Codetec */}
        <img src="/assets/images/CODETEC.png" alt="Codetec Logo" className="logo" />

        {/* Título y subtítulo */}
        <h1 className="login-title">Inicia Sesión</h1>
        <p className="login-subtitle">Accede a tu cuenta del sistema de inventarios</p>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          {/* Input de Email */}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              {...register("Email", { required: "El email es obligatorio" })}
              placeholder="Ingresa tu email"
              className="input-field"
            />
            {/* Mensaje de error */}
            {errors.Email && <span className="error-message">{errors.Email.message}</span>}
          </div>

          {/* Input de Contraseña */}
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              {...register("Password", { required: "La contraseña es obligatoria" })}
              placeholder="Ingresa tu contraseña"
              className="input-field"
            />
            {/* Mensaje de error */}
            {errors.Password && <span className="error-message">{errors.Password.message}</span>}
          </div>

          {/* Botón de Ingreso */}
          <button type="submit" className="submit-button">Ingresar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
