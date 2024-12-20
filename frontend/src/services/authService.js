const API_URL = "http://localhost:3000/api/auth/login";

const authService = {
    /**
     * Inicia sesión y guarda el token en localStorage.
     * @param {string} email - Correo electrónico del usuario.
     * @param {string} password - Contraseña del usuario.
     * @returns {object} - Datos de la respuesta (token y mensaje).
     */
    login: async (email, password) => {
        try {
            console.log("Enviando solicitud al servidor...", { Email: email, Password: password });

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Email: email, Password: password }),
            });

            console.log("Respuesta completa del servidor:", response);

            if (!response.ok) {
                console.error("Error en el servidor:", response.status, response.statusText);
                throw new Error("Correo o contraseña incorrectos");
            }

            const data = await response.json();
            console.log("Datos recibidos:", data);

            // Guarda el token en localStorage
            localStorage.setItem("token", data.token);
            console.log("Token guardado en localStorage:", data.token);

            return data; // Retorna la respuesta del servidor
        } catch (error) {
            console.error("Error en el login:", error.message);
            throw error; // Re-lanza el error para manejarlo en el componente
        }
    },

    /**
     * Obtiene el token JWT del localStorage.
     * @returns {string|null} - Token JWT si existe, de lo contrario null.
     */
    getToken: () => {
        const token = localStorage.getItem("token");
        console.log("Token obtenido del localStorage:", token);
        return token;
    },

    /**
     * Cierra sesión eliminando el token del localStorage.
     */
    logout: () => {
        console.log("Cerrando sesión y eliminando token...");
        localStorage.removeItem("token");
        console.log("Token eliminado.");
    },

    /**
     * Verifica si el usuario está autenticado.
     * @returns {boolean} - Devuelve true si el token existe, de lo contrario false.
     */
    isAuthenticated: () => {
        const token = localStorage.getItem("token");
        const isAuth = !!token; // Convierte a booleano
        console.log("¿El usuario está autenticado?", isAuth);
        return isAuth;
    },
};

export default authService;
