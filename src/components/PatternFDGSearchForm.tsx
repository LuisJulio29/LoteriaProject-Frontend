import React, { useState } from 'react';
import Spinner from './Spinner';

interface PatternFDGSearchFormProps {
  onSubmit: (fdg: string, jornada: string) => Promise<void>;
  onCancel: () => void;
}

export default function PatternFDGSearchForm({ onSubmit, onCancel }: PatternFDGSearchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fdg, setFDG] = useState('');
  const [jornada, setJornada] = useState('dia');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(fdg, jornada);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4 text-center">Búsqueda de Patrones por FDG</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">FDG</label>
              <input
                type="text"
                value={fdg}
                onChange={(e) => setFDG(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: 0201"
                disabled={isSubmitting}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jornada</label>
              <select
                value={jornada}
                onChange={(e) => setJornada(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isSubmitting}
              >
                <option value="dia">Día</option>
                <option value="noche">Noche</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Spinner className="h-4 w-4 mr-2" />
                    Buscando...
                  </div>
                ) : (
                  'Buscar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 