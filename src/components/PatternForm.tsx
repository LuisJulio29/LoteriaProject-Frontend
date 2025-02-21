import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Pattern } from '../types';
import Spinner from './Spinner';

interface PatternFormProps {
  onSubmit: (pattern: Omit<Pattern, 'id'>) => void;
  initialData?: Pattern;
  onCancel: () => void;
}

export default function PatternForm({ onSubmit, initialData, onCancel }: PatternFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    jornada: 'dia',
    patronNumbers: Array(10).fill(0),
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: format(new Date(initialData.date), 'yyyy-MM-dd'),
        jornada: initialData.jornada,
        patronNumbers: initialData.patronNumbers,
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

  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...formData.patronNumbers];
    newNumbers[index] = parseInt(value) || 0;
    setFormData({ ...formData, patronNumbers: newNumbers });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {initialData ? 'Editar Patron' : 'Añadir Nuevo Patron'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jornada</label>
                <select
                  value={formData.jornada}
                  onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="dia">Día</option>
                  <option value="noche">Noche</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patron</label>
              <div className="grid grid-cols-5 gap-2">
                {formData.patronNumbers.map((number, index) => (
                  <div key={index}>
                    <label className="block text-xs text-gray-500 mb-1">Numero {index}</label>
                    <input
                      type="number"
                      min="0"
                      value={number}
                      onChange={(e) => handleNumberChange(index, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
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
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
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
    </div>
  );
}