import React, { useState } from 'react';
import { format } from 'date-fns';
import Spinner from './Spinner';

interface PatternRangeFormProps {
  onSubmit: (startDate: string, startJornada: string, endDate: string, endJornada: string) => Promise<void>;
  onCancel: () => void;
}

export default function PatternRangeForm({ onSubmit, onCancel }: PatternRangeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startJornada: 'dia',
    endDate: format(new Date(), 'yyyy-MM-dd'),
    endJornada: 'noche',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(
        formData.startDate,
        formData.startJornada,
        formData.endDate,
        formData.endJornada
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Calcular Rango de Patrones</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Inicial</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jornada Inicial</label>
                <select
                  value={formData.startJornada}
                  onChange={(e) => setFormData({ ...formData, startJornada: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="dia">Día</option>
                  <option value="noche">Noche</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Final</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Jornada Final</label>
                <select
                  value={formData.endJornada}
                  onChange={(e) => setFormData({ ...formData, endJornada: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="dia">Día</option>
                  <option value="noche">Noche</option>
                </select>
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
                    Calculando...
                  </>
                ) : (
                  'Calcular'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}