/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import {SorteoPattern, SorteoPatronRedundancy } from '../types';
import { Pencil, Trash2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSorteoRedundancyInDate, getSorteoNumbersNotPlayed, getSorteoVoidInDay, getSorteoTotalForColumn } from '../services/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import React from 'react';

interface SorteoPatternDisplayProps {
  Sorteopattern: SorteoPattern;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  redundancyData?: SorteoPatronRedundancy[];
  onRedundancyClick?: (SorteoPattern: SorteoPattern) => void;
  Sorteos?: { number: string;serie: string;  date: string; loteria: string;}[];
  generatedSorteos?: { number: string; serie: string; date: string; loteria: string; }[];
  isLoadingSorteos?: boolean;
}

export default function SorteoPatternDisplay({
  Sorteopattern,
  onEdit,
  onDelete,
  showActions = false,
  redundancyData,
  Sorteos,
  generatedSorteos,
  isLoadingSorteos
}: SorteoPatternDisplayProps) {
  const isAdmin = localStorage.getItem('role') === '0';
  const maxValue = Math.max(...Sorteopattern.patronNumbers);
  const [activeTab, setActiveTab] = useState<'generators' | 'generated' | 'redundancy' | 'void'>('generators');
  const [numbersNotPlayed, setNumbersNotPlayed] = useState<string[]>([]);
  const [columnTotals, setColumnTotals] = useState<number[]>([]);
  const [redundancyInDate, setRedundancyInDate] = useState<SorteoPattern[]>([]);
  const [voidPatterns, setVoidPatterns] = useState<SorteoPattern[]>([]);
  const [isLoadingRedundancy, setIsLoadingRedundancy] = useState(false);
  const [isLoadingVoid, setIsLoadingVoid] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  
  // Pagination state for concurrency table
  const [currentConcurrencyPage, setCurrentConcurrencyPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page for concurrency table

  // Calculate pagination for concurrency table
  const totalConcurrencyPages = redundancyData ? Math.ceil(redundancyData.length / itemsPerPage) : 0;
  const startIndex = (currentConcurrencyPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConcurrencyItems = redundancyData?.slice(startIndex, endIndex) || [];
  console.log(redundancyData);

  const handleConcurrencyPageChange = (page: number) => {
    setCurrentConcurrencyPage(page);
  };

  useEffect(() => {
    loadAnalysisData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Sorteopattern]);

  const loadAnalysisData = async () => {
    setIsLoadingAnalysis(true);
    try {
      const [notPlayedData, totalData] = await Promise.all([
        getSorteoNumbersNotPlayed(Sorteopattern.date),
        getSorteoTotalForColumn(Sorteopattern.date)
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
        const data = await getSorteoRedundancyInDate(Sorteopattern.date);
        setRedundancyInDate(data);
      } catch (error) {
        toast.error('Error al cargar datos de redundancia');
      } finally {
        setIsLoadingRedundancy(false);
      }
    } else if (tab === 'void') {
      setIsLoadingVoid(true);
      try {
        const data = await getSorteoVoidInDay(Sorteopattern.id!);
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

  const handleRedundancyClick = (pattern: SorteoPattern) => {
    // Open in a new tab with the pattern's date and jornada
    const url = `/Sorteopatron?date=${pattern.date}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Pattern Results Chart */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Resultados del Patron</h3>
            <p className="text-md text-gray-600">
              Fecha: {new Date(Sorteopattern.date).toLocaleDateString()}
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
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
          {Sorteopattern.patronNumbers.map((count, index) => (
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
                      Contador
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ver más
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentConcurrencyItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(item.sorteoPatron.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{item.redundancyCount}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRedundancyClick?.(item.sorteoPatron)}
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

          {/* Pagination Controls */}
          <div className="px-3 sm:px-6 py-4 flex items-center justify-between border-t border-gray-200 mt-4">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{startIndex + 1}</span>{' '}
                  hasta{' '}
                  <span className="font-medium">
                    {Math.min(endIndex, redundancyData.length)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium">{redundancyData.length}</span>{' '}
                  resultados
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConcurrencyPageChange(currentConcurrencyPage - 1)}
                  disabled={currentConcurrencyPage === 1}
                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalConcurrencyPages }, (_, i) => i + 1)
                    .filter(page => {
                      return (
                        page === 1 ||
                        page === totalConcurrencyPages ||
                        Math.abs(page - currentConcurrencyPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-3 py-1 text-gray-500">...</span>
                            <button
                              onClick={() => handleConcurrencyPageChange(page)}
                              className={`px-3 py-1 rounded-md ${
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
                          className={`px-3 py-1 rounded-md ${
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
                  className="flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs and Content */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 sm:gap-4 border-b border-gray-200 min-w-max">
            <button
              onClick={() => setActiveTab('generators')}
              className={`px-2 sm:px-4 py-2 font-medium text-sm ${
                activeTab === 'generators'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Generadores
            </button>
            <button
              onClick={() => setActiveTab('generated')}
              className={`px-2 sm:px-4 py-2 font-medium text-sm ${
                activeTab === 'generated'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Generados
            </button>
            <button
              onClick={() => setActiveTab('redundancy')}
              className={`px-2 sm:px-4 py-2 font-medium text-sm ${
                activeTab === 'redundancy'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Redundancia
            </button>
            <button
              onClick={() => setActiveTab('void')}
              className={`px-2 sm:px-4 py-2 font-medium text-sm ${
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
          isLoadingSorteos ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-8 w-8 text-indigo-600" />
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
                  {(activeTab === 'generators' ? Sorteos : generatedSorteos)?.map((Sorteo, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{Sorteo.number}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{Sorteo.serie}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(Sorteo.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{Sorteo.loteria}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                      Numeros del Patron
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {redundancyInDate.map((Sorteopattern, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(Sorteopattern.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Sorteopattern.patronNumbers.map((num, idx) => (
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
                      Numeros del Patron
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {voidPatterns.map((Sorteopattern, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(Sorteopattern.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Sorteopattern.patronNumbers.map((num, idx) => (
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
      </div>
    </div>
  );
}