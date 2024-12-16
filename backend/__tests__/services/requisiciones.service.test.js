const RequisicionesModel = require('../../src/models/requisiciones.model');
const RequisicionesService = require('../../src/services/requisiciones.service');

jest.mock('../../src/models/requisiciones.model');

describe('Pruebas unitarias: RequisicionesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Debería aceptar una requisición en estado Pendiente', async () => {
    // Mock de la función que obtiene la requisición
    RequisicionesModel.obtenerPorId.mockResolvedValue({
      ID_Requisicion: 1,
      Estado_Requisicion: 'Pendiente',
    });

    // Mock de la función que actualiza la requisición
    RequisicionesModel.actualizarEstado.mockResolvedValue({
      ID_Requisicion: 1,
      Estado_Requisicion: 'Aceptada',
    });

    const resultado = await RequisicionesService.aceptarRequisicion(1);

    expect(resultado).toEqual({
      ID_Requisicion: 1,
      Estado_Requisicion: 'Aceptada',
    });
    expect(RequisicionesModel.obtenerPorId).toHaveBeenCalledWith(1);
    expect(RequisicionesModel.actualizarEstado).toHaveBeenCalledWith(1, 'Aceptada');
  });

  test('Debería lanzar un error al intentar aceptar una requisición que no está Pendiente', async () => {
    // Mock de una requisición con estado no Pendiente
    RequisicionesModel.obtenerPorId.mockResolvedValue({
      ID_Requisicion: 1,
      Estado_Requisicion: 'Aceptada',
    });

    await expect(RequisicionesService.aceptarRequisicion(1)).rejects.toThrow(
      'Solo se pueden aceptar requisiciones en estado Pendiente'
    );

    expect(RequisicionesModel.obtenerPorId).toHaveBeenCalledWith(1);
    expect(RequisicionesModel.actualizarEstado).not.toHaveBeenCalled();
  });
});
