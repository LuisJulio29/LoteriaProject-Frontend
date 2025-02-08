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
    sign: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        number: initialData.number,
        date: format(new Date(initialData.date), 'yyyy-MM-dd'),
        loteria: initialData.loteria,
        jornada: initialData.jornada,
        sign: initialData.sign,
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
            <label className="block text-sm font-medium text-gray-700">Loteria</label>
              <select
                required
                value={formData.loteria}
                onChange={(e) => setFormData({ 
                  ...formData, loteria: e.target.value, sign: e.target.value === "Astro" ? formData.sign : ""})}
                className="w-full px-4 py-2 border rounded-md"
                disabled={isSubmitting}>
              <option value={"Seleccione Un Chance"}></option>
              <option value={"Antioqueñita"}>Antioqueñita</option>
              <option value={"Astro"}>Astro</option>
              <option value={"Cafeterito"}>Cafeterito</option>
              <option value={"Caribeña"}>Caribeña</option>
              <option value={"Chontico"}>Chontico</option>
              <option value={"Culona"}>Culona</option>
              <option value={"Dorado"}>Dorado</option>
              <option value={"Fantastica"}>Fantastica</option>
              <option value={"Motilon"}>Motilon</option>
              <option value={"Paisita"}>Paisita</option>
              <option value={"Pijao De Oro"}>Pijao</option>
              <option value={"Saman"}>Saman</option>
              <option value={"Sinuano"}>Sinuano</option>
            </select>
          </div>
         {/* Renderizar el select de signo solo cuando la lotería es Astro */}
          {formData.loteria === "Astro" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Signo</label>
              <select
                required
                value={formData.sign}
                onChange={(e) => setFormData({ ...formData, sign: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
                disabled={isSubmitting}
              >
                <option value="">Seleccione un signo</option>
                <option value="Leo">Leo</option>
                <option value="Virgo">Virgo</option>
                <option value="Libra">Libra</option>
                <option value="Escorpio">Escorpio</option>
                <option value="Sagitario">Sagitario</option>
                <option value="Capricornio">Capricornio</option>
                <option value="Acuario">Acuario</option>
                <option value="Piscis">Piscis</option>
                <option value="Aries">Aries</option>
                <option value="Tauro">Tauro</option>
                <option value="Geminis">Geminis</option>
                <option value="Cancer">Cancer</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Jornada</label>
            <select
              required
              value={formData.jornada}
              onChange={(e) => setFormData({ ...formData, jornada: e.target.value })}
              className="w-full px-4 py-2 border rounded-md">
              disabled={isSubmitting}
              <option value={""}></option>
              <option value={"Dia"}>Dia</option>
              <option value={"Tarde"}>Tarde</option>
              <option value={"Noche"}>Noche</option>
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