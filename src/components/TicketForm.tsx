import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Ticket } from '../types';
import Spinner from './Spinner';

interface TicketFormProps {
  onSubmit: (ticket: Omit<Ticket, 'id'>) => void;
  initialData?: Ticket;
  onCancel: () => void;
}

export default function TicketForm({ onSubmit, initialData, onCancel }: TicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    loteria: '',
    jornada: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        number: initialData.number,
        date: format(new Date(initialData.date), 'yyyy-MM-dd'),
        loteria: initialData.loteria,
        jornada: initialData.jornada,
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
          {initialData ? 'Editar Chance' : 'Añadir Nuevo Chance'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700">Loteria</label>
            <input
              type="text"
              value={formData.loteria}
              onChange={(e) => setFormData({ ...formData, loteria: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-md focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jornada</label>
            <input
              type="text"
              value={formData.jornada}
              onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
              className="mt-2 block w-full rounded-md border-gray-300 shadow-md focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-center space-x-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                initialData ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}