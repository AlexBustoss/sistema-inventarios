import React from 'react';
import Dialog, { DialogTitle, DialogContent, DialogFooter } from '../UI/Dialog'; // Importar Dialog como default y las exportaciones nombradas
import Button from '../UI/Button'; // Importar Button

import { CalendarDays, User, Archive, RefreshCcw } from 'lucide-react';

const DetallesMovimientoModal = ({ isOpen, onClose, movimiento }) => {
  if (!movimiento) return null;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Detalles del Movimiento</DialogTitle>
      <DialogContent>
        <div className="flex items-center gap-2">
          <Archive className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Pieza:</span> {movimiento.nombre_pieza}
        </div>

        <div className="flex items-center gap-2">
          <RefreshCcw className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Tipo de Movimiento:</span> {movimiento.tipo}
        </div>

        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Usuario:</span> {movimiento.usuario || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-gray-500" />
          <span className="font-medium">Fecha:</span> {new Date(movimiento.fecha).toLocaleString()}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Proyecto Anterior:</span>
            <p>{movimiento.proyecto_anterior || 'N/A'}</p>
          </div>
          <div>
            <span className="font-medium">Proyecto Nuevo:</span>
            <p>{movimiento.proyecto_nuevo || 'N/A'}</p>
          </div>
        </div>

        <div>
          <span className="font-medium">Cantidad Movida:</span>
          <p>{movimiento.cantidad}</p>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button onClick={onClose} variant="outline" className="w-full">
          Cerrar
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DetallesMovimientoModal;
