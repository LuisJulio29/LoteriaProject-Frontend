import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Sorteo } from '../types';
import Spinner from './Spinner';

interface SorteoFormProps {
  onSubmit: (ticket: Omit<Sorteo, 'id'>) => void;
  initialData?: Sorteo;
  onCancel: () => void;
}

export default function SorteoForm({ onSubmit, initialData, onCancel }: SorteoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    serie: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    loteria: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        number: initialData.number,
        date: format(new Date(initialData.date), 'yyyy-MM-dd'),
        loteria: initialData.loteria,
        serie: initialData.serie,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 className="text-lg font-semibold mb-4 text-center">
          {initialData ? 'Editar Sorteo' : 'Añadir Nuevo Sorteo'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-md focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Numero</label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-md focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Serie</label>
            <input
              type="text"
              value={formData.serie}
              onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-md focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Loteria</label>
              <select
                required
                value={formData.loteria}
                onChange={(e) => setFormData({ 
                  ...formData, loteria: e.target.value})}
                className="w-full px-4 py-2 border rounded-md"
                disabled={isSubmitting}>
              <option value={"Seleccione Un Chance"}></option>
              <option value={"Cundinamarca"}>Cundinamarca</option>
              <option value={"Tolima"}>Tolima</option>
              <option value={"Cruz Roja"}>Cruz Roja</option>
              <option value={"Huila"}>Huila</option>
              <option value={"Manizales"}>Manizales</option>
              <option value={"Meta"}>Meta</option>
              <option value={"Valle"}>Valle</option>
              <option value={"Bogota"}>Bogotá</option>
              <option value={"Quindio"}>Quindío</option>
              <option value={"Santander"}>Santander</option>
              <option value={"Medellin"}>Medellin</option>
              <option value={"Risaralda"}>Risaralda</option>
              <option value={"Boyaca"}>Boyacá</option>
              <option value={"Cauca"}>Cauca</option>
              <option value={"Super Chontico"}>Super Chontico</option>
              <option value={"Extra"}>Extra</option>
            </select>
          </div>
          <div className="flex justify-center space-x-2 pt-4">
          
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  {initialData ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                initialData ? 'Actualizar' : 'Crear'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}