import { useState } from 'react';
import { Pattern, PatronRedundancy } from '../types';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';

interface PatternDisplayProps {
  pattern: Pattern;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  redundancyData?: PatronRedundancy[];
  onRedundancyClick?: (pattern: Pattern) => void;
  tickets?: { number: string; date: string; loteria: string; jornada: string }[];
  generatedTickets?: { number: string; date: string; loteria: string; jornada: string }[];
  isLoadingTickets?: boolean;
}

export default function PatternDisplay({
  pattern,
  onEdit,
  onDelete,
  showActions = false,
  redundancyData,
  onRedundancyClick,
  tickets,
  generatedTickets,
  isLoadingTickets
}: PatternDisplayProps) {
  const isAdmin = localStorage.getItem('role') === '0';
  const maxValue = Math.max(...pattern.patronNumbers);
  const [activeTab, setActiveTab] = useState<'generators' | 'generated'>('generators');

  const displayTickets = activeTab === 'generators' ? tickets : generatedTickets;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Pattern Results</h3>
            <p className="text-sm text-gray-600">
              Date: {new Date(pattern.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Jornada: {pattern.jornada}
            </p>
          </div>
          {showActions && isAdmin && (
            <div className="flex space-x-2">
              <button
                onClick={onEdit}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <Pencil className="h-5 w-5" />
              </button>
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-10 gap-2">
          {pattern.patronNumbers.map((count, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-sm text-gray-600 mb-1">{index}</div>
              <div className="w-full bg-gray-100 rounded-lg relative" style={{ height: '200px' }}>
                <div
                  className="absolute bottom-0 w-full bg-indigo-500 rounded-lg transition-all duration-300"
                  style={{
                    height: `${(count / maxValue) * 100}%`,
                  }}
                />
              </div>
              <div className="text-lg font-semibold mt-1">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Concurrencia Table */}
      {redundancyData && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Concurrencia</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jornada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Redundancia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ver Más
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {redundancyData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(item.patron.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.patron.jornada}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.redundancyCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onRedundancyClick?.(item.patron)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      {(tickets || generatedTickets) && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Tickets</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('generators')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'generators' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Generadores
              </button>
              <button
                onClick={() => setActiveTab('generated')}
                className={`px-4 py-2 rounded-md ${
                  activeTab === 'generated' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Generados
              </button>
            </div>
          </div>
          
          {isLoadingTickets ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loteria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jornada
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayTickets?.map((ticket, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{ticket.number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(ticket.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{ticket.loteria}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{ticket.jornada}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}