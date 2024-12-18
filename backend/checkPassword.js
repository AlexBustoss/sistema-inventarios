const bcrypt = require('bcrypt');

const verificarPassword = async () => {
    const passwordIngresada = 'defaultPassword'; // Contraseña ingresada
    const hashAlmacenado = '$2b$10$K8CnN1/S4lL38w2aRqIMlOFK7Q8e1l4oJb4.yt4x6flU6MJbd2xVm'; // Hash en la base de datos

    const esCorrecta = await bcrypt.compare(passwordIngresada, hashAlmacenado);
    console.log('¿Contraseña correcta?', esCorrecta);
};

verificarPassword();
