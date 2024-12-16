const request = require('supertest');
const app = require('../../src/index');
const RequisicionesModel = require('../../src/models/requisiciones.model');

jest.mock('../../src/models/requisiciones.model');

describe('Pruebas de integración: Requisiciones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debería aceptar una requisición en estado Pendiente', async () => {
    // Simulamos la requisición inicial
    RequisicionesModel.obtenerPorId.mockResolvedValue({
      ID_Requisicion: 1,
      Estado_Requisicion: 'Pendiente',
    });

    // Simulamos la actualización
    RequisicionesModel.actualizarEstado.mockResolvedValue({
      ID_Requisicion: 1,
      Estado_Requisicion: 'Aceptada',
    });

    const res = await request(app).put('/api/requisiciones/1/aceptar');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Requisición aceptada exitosamente');
    expect(res.body.resultado.Estado_Requisicion).toBe('Aceptada');
  });

  test('Debería fallar al aceptar una requisición que no está en estado Pendiente', async () => {
    // Simulamos una requisición no Pendiente
    RequisicionesModel.obtenerPorId.mockResolvedValue({
      ID_Requisicion: 1,
      Estado_Requisicion: 'Aceptada',
    });

    const res = await request(app).put('/api/requisiciones/1/aceptar');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Solo se pueden aceptar requisiciones en estado Pendiente');
  });
});
