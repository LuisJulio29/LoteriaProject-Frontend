import { useState, useEffect } from 'react';
import { Pattern, Ticket } from '../types';
import Spinner from './Spinner';
import { X } from 'lucide-react';

interface PatternRedundancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  patron1Id: number | undefined;
  patron2Id: number | undefined;
}

interface RedundancyAnalysisResult {
  patron : Pattern;
  numbersToSearch: number[];
  ticketsCon4Coincidencias: Ticket[];
  ticketsCon3Coincidencias: Ticket[];
}

export default function PatternRedundancyModal({
  isOpen,
  onClose,
  patron1Id,
  patron2Id
}: PatternRedundancyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<RedundancyAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !patron1Id || !patron2Id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://localhost:7267/api/Patrons/AnalyzePatternRedundancy?patron1Id=${patron1Id}&patron2Id=${patron2Id}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos de redundancia');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, patron1Id, patron2Id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{data && new Date(data.patron.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })} / {data?.patron.jornada}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner className="h-10 w-10 text-indigo-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Numbers to search */}
              <div>
                <h3 className="text-lg text-center font-medium text-gray-900 mb-3">Números en común</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {data.numbersToSearch.map((num, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Tickets with 4 coincidences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tickets con 4 Coincidencias</h3>
                {data.ticketsCon4Coincidencias.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lotería</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.ticketsCon4Coincidencias.map((ticket) => (
                          <tr key={ticket.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{ticket.number} {ticket.sign}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{ticket.loteria}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No se encontraron tickets con 4 coincidencias</p>
                )}
              </div>
              
              {/* Tickets with 3 coincidences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tickets con 3 Coincidencias</h3>
                {data.ticketsCon3Coincidencias.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lotería</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.ticketsCon3Coincidencias.map((ticket) => (
                          <tr key={ticket.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{ticket.number} {ticket.sign}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{ticket.loteria}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No se encontraron tickets con 3 coincidencias</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay datos disponibles</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}