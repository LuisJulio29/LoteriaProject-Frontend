import React, { useState } from 'react';
import Spinner from './Spinner';

interface PatternSearchFormProps {
  onSubmit: (numbers: number[]) => Promise<void>;
  onCancel: () => void;
}

export default function PatternSearchForm({ onSubmit, onCancel }: PatternSearchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numbers, setNumbers] = useState<string[]>(Array(10).fill(''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const numbersToSubmit = numbers.map(n => n === '' ? -1 : parseInt(n));
      await onSubmit(numbersToSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNumberChange = (index: number, value: string) => {
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99)) {
      const newNumbers = [...numbers];
      newNumbers[index] = value;
      setNumbers(newNumbers);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4 text-center">Busqueda de Patrones</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Números del Patrón</label>
              <div className="grid grid-cols-5 gap-2">
                {numbers.map((number, index) => (
                  <div key={index}>
                    <label className="block text-xs text-gray-500 mb-2">Número {index}</label>
                    <input
                      type="number"
                      min="0"
                      value={number}
                      onChange={(e) => handleNumberChange(index, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="-"
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
                    Buscando...
                  </>
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