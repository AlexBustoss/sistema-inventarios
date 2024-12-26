const API_URL = "http://localhost:3000/api/auth";

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

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Email: email, Password: password }),
            });

            if (!response.ok) {
                console.error("Error en el servidor:", response.status, response.statusText);
                throw new Error("Correo o contraseña incorrectos");
            }

            const data = await response.json();
            console.log("Datos recibidos:", data);

            // Guarda el token y nombre del usuario en localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.nombre); // Suponiendo que el backend devuelve el nombre del usuario
            console.log("Token y nombre del usuario guardados en localStorage");

            return data;
        } catch (error) {
            console.error("Error en el login:", error.message);
            throw error;
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
     * Obtiene información del usuario autenticado.
     * @returns {object|null} - Datos del usuario si el token es válido, de lo contrario null.
     */
    getAuthenticatedUser: async () => {
        try {
            const token = authService.getToken();
            if (!token) {
                throw new Error("No se encontró un token. El usuario no está autenticado.");
            }

            const response = await fetch(`${API_URL}/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error("Error al obtener datos del usuario:", response.status, response.statusText);
                throw new Error("Error al obtener información del usuario.");
            }

            const userData = await response.json();
            console.log("Datos del usuario autenticado:", userData);

            // Guardar datos del usuario en localStorage si es necesario
            localStorage.setItem("userName", userData.nombre);
            return userData;
        } catch (error) {
            console.error("Error al obtener datos del usuario autenticado:", error.message);
            return null;
        }
    },

    /**
     * Valida si el token JWT ha expirado.
     * @returns {boolean} - True si el token es válido, False si ha expirado o no existe.
     */
    validateToken: () => {
        const token = authService.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split(".")[1])); // Decodificar payload del token
            const isExpired = payload.exp * 1000 < Date.now(); // Verificar si el token ha expirado
            if (isExpired) {
                console.log("El token ha expirado.");
                authService.logout();
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error al validar el token:", error);
            return false;
        }
    },

    /**
     * Verifica si el usuario tiene un rol específico.
     * @param {string} role - Rol que se desea verificar.
     * @returns {boolean} - True si el usuario tiene el rol, False de lo contrario.
     */
    hasRole: (role) => {
        const token = authService.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.Rol === role;
        } catch (error) {
            console.error("Error al verificar el rol del usuario:", error);
            return false;
        }
    },

    /**
     * Cierra sesión eliminando el token y otros datos del localStorage.
     */
    logout: () => {
        console.log("Cerrando sesión y eliminando token...");
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        console.log("Token y datos del usuario eliminados.");
    },

    /**
     * Verifica si el usuario está autenticado.
     * @returns {boolean} - Devuelve true si el token existe, de lo contrario false.
     */
    isAuthenticated: () => {
        const token = localStorage.getItem("token");
        const isAuth = !!token;
        console.log("¿El usuario está autenticado?", isAuth);
        return isAuth;
    },
};

export default authService;
