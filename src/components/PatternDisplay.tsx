/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Pattern, PatronRedundancy } from '../types';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import { getRedundancyInDate, getNumbersNotPlayed, getVoidInDay } from '../services/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';

interface PatternDisplayProps {
  pattern: Pattern;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  redundancyData?: PatronRedundancy[];
  onRedundancyClick?: (pattern: Pattern) => void;
  tickets?: { number: string; date: string; loteria: string; jornada: string ;sign: string}[];
  generatedTickets?: { number: string; date: string; loteria: string; jornada: string ;sign :string}[];
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
  const [activeTab, setActiveTab] = useState<'generators' | 'generated' | 'analysis'>('generators');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'redundancy-date' | 'not-played' | 'void-patterns'>('redundancy-date');
  const [redundancyInDate, setRedundancyInDate] = useState<Pattern[]>([]);
  const [numbersNotPlayed, setNumbersNotPlayed] = useState<string[]>([]);
  const [voidPatterns, setVoidPatterns] = useState<Pattern[]>([]);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const displayTickets = activeTab === 'generators' ? tickets : generatedTickets;

  useEffect(() => {
    if (activeTab === 'analysis') {
      loadAnalysisData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeAnalysisTab]);

  const loadAnalysisData = async () => {
    setIsLoadingAnalysis(true);
    try {
      switch (activeAnalysisTab) {
        case 'redundancy-date':
          { const redundancyData = await getRedundancyInDate(pattern.date);
          setRedundancyInDate(redundancyData);
          break; }
        case 'not-played':
          { const notPlayedData = await getNumbersNotPlayed(pattern.date, pattern.jornada);
          setNumbersNotPlayed(notPlayedData);
          break; }
        case 'void-patterns':
          { const voidData = await getVoidInDay(pattern.id!);
          setVoidPatterns(voidData);
          break; }
      }
    } catch (error) {
      toast.error('Error al cargar datos de análisis');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const renderAnalysisContent = () => {
    if (isLoadingAnalysis) {
      return (
        <div className="flex justify-center items-center py-8">
          <Spinner className="h-8 w-8 text-indigo-600" />
        </div>
      );
    }

    switch (activeAnalysisTab) {
      case 'redundancy-date':
        return (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">Redundancia en fecha</h3>
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
                    Numeros del Patron
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {redundancyInDate.map((pattern, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(pattern.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{pattern.jornada}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {pattern.patronNumbers.map((num, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'not-played':
        return (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">Números No Jugados</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {numbersNotPlayed.map((number, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 text-center font-mono text-lg"
                >
                  {number}
                </div>
              ))}
            </div>
          </div>
        );

      case 'void-patterns':
        return (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">Patrones con 0</h3>
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
                    Numeros del Patron
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {voidPatterns.map((pattern, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(pattern.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{pattern.jornada}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {pattern.patronNumbers.map((num, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Resultados del Patron</h3>
            <p className="text-sm text-gray-600">
              Fecha: {new Date(pattern.date).toLocaleDateString()}
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
                    Contador de Redundancia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ver más
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

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('generators')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'generators'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Generadores
            </button>
            <button
              onClick={() => setActiveTab('generated')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'generated'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Generados
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Análisis
            </button>
          </div>
        </div>

        {activeTab === 'analysis' ? (
          <div>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveAnalysisTab('redundancy-date')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeAnalysisTab === 'redundancy-date'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Redundancia en fecha
              </button>
              <button
                onClick={() => setActiveAnalysisTab('not-played')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeAnalysisTab === 'not-played'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Números No Jugados
              </button>
              <button
                onClick={() => setActiveAnalysisTab('void-patterns')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeAnalysisTab === 'void-patterns'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Patrones con 0
              </button>
            </div>
            {renderAnalysisContent()}
          </div>
        ) : (
          isLoadingTickets ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
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
                      <td className="px-6 py-4 whitespace-nowrap">{ticket.number} {ticket.sign}</td>
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
          )
        )}
      </div>
    </div>
  );
}