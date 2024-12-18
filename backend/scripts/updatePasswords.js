const bcrypt = require('bcrypt');
const { initPool } = require('../src/config/db'); // Asegúrate de tener initPool configurado correctamente
const pool = initPool();

const actualizarContraseñas = async () => {
    try {
        // Obtener usuarios de la base de datos
        const usuarios = await pool.query('SELECT "ID_Usuario", "Password" FROM usuarios');

        if (usuarios.rows.length === 0) {
            console.log('No hay usuarios para actualizar.');
            return;
        }

        // Actualizar contraseñas no hasheadas
        for (const usuario of usuarios.rows) {
            try {
                if (!usuario.Password.startsWith('$2b$')) {
                    const hashedPassword = await bcrypt.hash(usuario.Password, 10);
                    await pool.query(
                        'UPDATE usuarios SET "Password" = $1 WHERE "ID_Usuario" = $2',
                        [hashedPassword, usuario.ID_Usuario]
                    );
                    console.log(`Contraseña actualizada para el usuario ID ${usuario.ID_Usuario}`);
                }
            } catch (err) {
                console.error(`Error al actualizar contraseña para el usuario ID ${usuario.ID_Usuario}:`, err.message);
            }
        }

        console.log('Actualización completada.');
    } catch (error) {
        console.error('Error al actualizar contraseñas:', error.message);
    } finally {
        pool.end();
    }
};

actualizarContraseñas();
