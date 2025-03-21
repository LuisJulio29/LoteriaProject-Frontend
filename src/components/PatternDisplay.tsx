/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { Pattern, PatronRedundancy, PatronForVoid } from '../types';
import { Pencil, ExternalLink, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
import { getRedundancyInDate, getNumbersNotPlayed, getVoidInDay, getTotalForColumn } from '../services/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import React from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import PatternRedundancyModal from './PatternRedundancyModal';

interface PatternDisplayProps {
  pattern: Pattern;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  redundancyData?: PatronRedundancy[];
  onRedundancyClick?: (pattern: Pattern) => void;
  tickets?: { number: string; date: string; loteria: string; jornada: string; sign: string }[];
  sorteos?: { number: string; date: string; serie: string; loteria: string;  }[];
  generatedTickets?: { number: string; date: string; loteria: string; jornada: string; sign: string }[];
  generatedSorteos?: { number: string; date: string; serie: string; loteria: string;  }[];
  isLoadingTickets?: boolean;
}

export default function PatternDisplay({
  pattern,
  onEdit,
  onDelete = () => {},
  showActions = false,
  redundancyData,
  tickets,
  sorteos,
  generatedSorteos,
  generatedTickets,
  isLoadingTickets = false
}: PatternDisplayProps) {
  const isAdmin = localStorage.getItem('role') === '0';
  const maxValue = Math.max(...pattern.patronNumbers);
  const [activeTab, setActiveTab] = useState<'generators' | 'generated' | 'redundancy' | 'void'>('generators');
  const [numbersNotPlayed, setNumbersNotPlayed] = useState<string[]>([]);
  const [columnTotals, setColumnTotals] = useState<number[]>([]);
  const [redundancyInDate, setRedundancyInDate] = useState<Pattern[]>([]);
  const [voidPatterns, setVoidPatterns] = useState<PatronForVoid[]>([]);
  const [isLoadingRedundancy, setIsLoadingRedundancy] = useState(false);
  const [isLoadingVoid, setIsLoadingVoid] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  
  // Modal state
  const [isRedundancyModalOpen, setIsRedundancyModalOpen] = useState(false);
  const [selectedPatterns, setSelectedPatterns] = useState<{patron1Id?: number, patron2Id?: number}>({});
  
  // Pagination state for concurrency table
  const [currentConcurrencyPage, setCurrentConcurrencyPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page for concurrency table

  // Calculate pagination for concurrency table
  const totalConcurrencyPages = redundancyData ? Math.ceil(redundancyData.length / itemsPerPage) : 0;
  const startIndex = (currentConcurrencyPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConcurrencyItems = redundancyData?.slice(startIndex, endIndex) || [];

  const handleConcurrencyPageChange = (page: number) => {
    setCurrentConcurrencyPage(page);
  };

  useEffect(() => {
    loadAnalysisData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern]);

  const loadAnalysisData = async () => {
    setIsLoadingAnalysis(true);
    try {
      const [notPlayedData, totalData] = await Promise.all([
        getNumbersNotPlayed(pattern.date, pattern.jornada),
        getTotalForColumn(pattern.date, pattern.jornada)
      ]);
      setNumbersNotPlayed(notPlayedData);
      setColumnTotals(totalData);
    } catch (error) {
      toast.error('Error al cargar datos de análisis');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const loadTabData = async (tab: 'redundancy' | 'void') => {
    if (tab === 'redundancy') {
      setIsLoadingRedundancy(true);
      try {
        const data = await getRedundancyInDate(pattern.date);
        setRedundancyInDate(data);
      } catch (error) {
        toast.error('Error al cargar datos de redundancia');
      } finally {
        setIsLoadingRedundancy(false);
      }
    } else if (tab === 'void') {
      setIsLoadingVoid(true);
      try {
        const data = await getVoidInDay(pattern.id!);
        setVoidPatterns(data);
      } catch (error) {
        toast.error('Error al cargar datos de patrones con 0');
      } finally {
        setIsLoadingVoid(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'redundancy' || activeTab === 'void') {
      loadTabData(activeTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleRedundancyClick = (pattern: Pattern) => {
    // Open in a new tab with the pattern's date and jornada
    const url = `/patrones?date=${pattern.date}&jornada=${pattern.jornada}`;
    window.open(url, '_blank');
  };

  const handleRedundancyAnalysisClick = (patronItem: PatronRedundancy) => {
    setSelectedPatterns({
      patron2Id: pattern.id,
      patron1Id: patronItem.patron.id
    });
    setIsRedundancyModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Pattern Results Chart */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Resultados del Patron</h3>
            <p className="text-md text-gray-600">
              Fecha: {new Date(pattern.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
            </p>
            <p className="text-md text-gray-600">
              Jornada: {pattern.jornada}
            </p>
          </div>
          {showActions && isAdmin && (
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <button
                onClick={onEdit}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <Pencil className="h-5 w-5" />
              </button>
              <DeleteConfirmationModal 
            onDelete={onDelete}
            isLoading={isLoadingTickets}
            itemType="Patrón"
                  />
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
          {pattern.patronNumbers.map((count, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-md text-gray-900 mb-1">{index}</div>
              <div className="w-full bg-gray-100 rounded-lg relative" style={{ height: '180px', minWidth: '30px' }}>
                <div
                  className="absolute bottom-0 w-full bg-indigo-500 rounded-lg transition-all duration-300"
                  style={{
                    height: `${(count / maxValue) * 100}%`,
                  }}
                />
              </div>
              <div className="text-sm sm:text-lg font-bold mt-1">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Section - Mobile First */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column Totals - Moved to top on mobile */}
        <div className="order-1 md:order-2 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Sumatoria por Filas</h3>
          {isLoadingAnalysis ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-8 w-8 text-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {columnTotals.map((total, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <div className="text-sm text-gray-600 mb-2">Fila {index + 1}</div>
                  <div className="text-xl sm:text-2xl font-bold text-indigo-600">{total}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Numbers Not Played */}
        <div className="order-2 md:order-1 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Números No Jugados</h3>
          {isLoadingAnalysis ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-8 w-8 text-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {numbersNotPlayed.map((number, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-2 sm:p-4 text-center font-mono text-base sm:text-lg"
                >
                  {number}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Concurrency Table with Pagination */}
      {redundancyData && (
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Concurrencia</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jornada
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contador
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentConcurrencyItems.map((item, index) => (
                    <tr key={index}>
                       <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(item.patron.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{item.patron.jornada}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{item.redundancyCount}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleRedundancyClick(item.patron)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Ver detalles del patrón"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRedundancyAnalysisClick(item)}
                            className="text-emerald-600 hover:text-emerald-900"
                            title="Analizar redundancia"
                          >
                            <BarChart2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="px-2 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-200 mt-3 sm:mt-4 gap-2">
          <div className="text-xs sm:text-sm text-gray-700">
            <span className="font-medium">{startIndex + 1}</span>{' '}
            hasta{' '}
            <span className="font-medium">
              {Math.min(endIndex, redundancyData.length)}
            </span>{' '}
            de{' '}
            <span className="font-medium">{redundancyData.length}</span>{' '}
            resultados
          </div>
          <div className="flex gap-1 sm:gap-2 justify-center">
            <button
              onClick={() => handleConcurrencyPageChange(currentConcurrencyPage - 1)}
              disabled={currentConcurrencyPage === 1}
              className="flex items-center justify-center p-1.5 sm:px-3 sm:py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Anterior</span>
            </button>
            
            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
              {Array.from({ length: totalConcurrencyPages }, (_, i) => i + 1)
                .filter(page => {
                  // En móvil, solo mostrar el actual y 1 a cada lado
                  const isMobile = window.innerWidth < 640;
                  return (
                    page === 1 ||
                    page === totalConcurrencyPages ||
                    Math.abs(page - currentConcurrencyPage) <= (isMobile ? 0 : 1)
                  );
                })
                .map((page, index, array) => {
                  if (index > 0 && page - array[index - 1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="px-1.5 sm:px-3 py-1 text-gray-500 text-xs sm:text-sm">...</span>
                        <button
                          onClick={() => handleConcurrencyPageChange(page)}
                          className={`w-6 h-6 sm:w-8 sm:h-8 sm:px-3 sm:py-1 flex items-center justify-center rounded-md text-xs sm:text-sm ${
                            currentConcurrencyPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handleConcurrencyPageChange(page)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 sm:px-3 sm:py-1 flex items-center justify-center rounded-md text-xs sm:text-sm ${
                        currentConcurrencyPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
            </div>
            
            <button
              onClick={() => handleConcurrencyPageChange(currentConcurrencyPage + 1)}
              disabled={currentConcurrencyPage === totalConcurrencyPages}
              className="flex items-center justify-center p-1.5 sm:px-3 sm:py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              <span className="hidden sm:inline mr-1">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Tabs and Content */}
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
      <div className="mb-4 sm:mb-6 overflow-x-auto">
        <div className="flex gap-1 sm:gap-4 border-b border-gray-200 min-w-max">
          <button
            onClick={() => setActiveTab('generators')}
            className={`px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm ${
              activeTab === 'generators'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Generadores
          </button>
          <button
            onClick={() => setActiveTab('generated')}
            className={`px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm ${
              activeTab === 'generated'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Generados
          </button>
          <button
            onClick={() => setActiveTab('redundancy')}
            className={`px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm ${
              activeTab === 'redundancy'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Redundancia
          </button>
          <button
            onClick={() => setActiveTab('void')}
            className={`px-2 sm:px-4 py-2 font-medium text-xs sm:text-sm ${
              activeTab === 'void'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Patrones 0
          </button>
        </div>
      </div>

        {(activeTab === 'generators' || activeTab === 'generated') && (
        isLoadingTickets ? (
          <div className="flex justify-center items-center py-8">
            <Spinner className="h-8 w-8 text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Tabla de Tickets */}
            <div className="overflow-x-auto mb-8">
              <h3 className="text-lg font-bold mb-2 text-center">Chances</h3>
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
                  {(activeTab === 'generators' ? tickets : generatedTickets)?.map((ticket, index) => (
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
            {/* Tabla de Sorteos */}
            <div className="overflow-x-auto">
              <h3 className="text-lg font-bold mb-2 text-center">Loterias</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loteria
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(activeTab === 'generators' ? sorteos : generatedSorteos)?.map((sorteo, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{sorteo.number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{sorteo.serie}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(sorteo.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{sorteo.loteria}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}

        {activeTab === 'redundancy' && (
          isLoadingRedundancy ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-8 w-8 text-indigo-600" />
            </div>
          ) : (
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
                        <div className="flex whitespace-nowrap gap-1">
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
          )
        )}

        {activeTab === 'void' && (
          isLoadingVoid ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-8 w-8 text-indigo-600" />
            </div>
          ) : (
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
                      Numeros del Patron
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Redundancia
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  
                  {voidPatterns.map((data, index) => (
                    <tr key={index}>
                     <td className="px-6 py-4 whitespace-nowrap">
                     {new Date(data.patron.date).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">{data.patron.jornada}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {data.patron.patronNumbers.map((num, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100"
                            >{num}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {data.redundancyNumbers.map((num, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100"
                            >{num}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
       {/* Integración del Modal de Análisis de Redundancia */}
       <PatternRedundancyModal
        isOpen={isRedundancyModalOpen}
        onClose={() => setIsRedundancyModalOpen(false)}
        patron1Id={selectedPatterns.patron1Id}
        patron2Id={selectedPatterns.patron2Id}
      />
    </div>
  );
}