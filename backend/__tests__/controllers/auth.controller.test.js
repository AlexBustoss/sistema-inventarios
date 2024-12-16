const request = require('supertest');
const app = require('../../src/index'); // Asegúrate de exportar tu app desde index.js

describe('Pruebas de autenticación', () => {
  test('Debería iniciar sesión correctamente con credenciales válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Juan Pérez', password: '123456' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test('Debería fallar con credenciales incorrectas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Juan Pérez', password: 'contraseñaIncorrecta' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Contraseña incorrecta');
  });

  test('Debería fallar si el usuario no existe', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'UsuarioNoExistente', password: '123456' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Usuario no encontrado');
  });
});
