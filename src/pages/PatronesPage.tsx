/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { ExternalLink, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  searchPatterns,
  createPattern,
  updatePattern,
  deletePattern,
  calculatePattern,
  calculateRedundancy,
  getTicketsByDate,
  calculatePatternRange,
  getSorteosByDate,
  searchPatternsByNumbers,
} from '../services/api';
import { Pattern, PatronRedundancy } from '../types';
import PatternForm from '../components/PatternForm';
import PatternRangeForm from '../components/PatternRangeForm';
import PatternSearchForm from '../components/PatternSearchForm';
import PatternDisplay from '../components/PatternDisplay';
import Spinner from '../components/Spinner';
import { useSearchParams } from 'react-router-dom';

export default function PatronesPage() {
  const [searchParams] = useSearchParams();
  const [searchDate, setSearchDate] = useState(searchParams.get('date') || format(new Date(), 'yyyy-MM-dd'));
  const [searchJornada, setSearchJornada] = useState(searchParams.get('jornada') || 'dia');
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showRangeForm, setShowRangeForm] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redundancyData, setRedundancyData] = useState<PatronRedundancy[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);
  const [Sorteos, setSorteos] = useState<any[]>([]);
  const [generatedSorteos, setGeneratedSorteos] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [searchResults, setSearchResults] = useState<Pattern[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const isAdmin = localStorage.getItem('role') === '0';

  // Effect to handle URL parameters
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const jornadaParam = searchParams.get('jornada');
    
    if (dateParam && jornadaParam) {
      setSearchDate(dateParam);
      setSearchJornada(jornadaParam);
      handleSearch(dateParam, jornadaParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadRedundancyData = async (pattern: Pattern) => {
    try {
      const data = await calculateRedundancy(pattern);
      setRedundancyData(data);
    } catch (error) {
      toast.error('Error al cargar datos de redundancia');
    }
  };

  const loadTickets = async (pattern: Pattern) => {
    setIsLoadingTickets(true);
    try {
      const generatorTickets = await getTicketsByDate(pattern.date, pattern.jornada);
      setTickets(generatorTickets);
      let generatedDate = pattern.date;
      let generatedJornada = pattern.jornada;
      if (pattern.jornada.toLowerCase() === 'dia') {
        generatedJornada = 'noche';
      } else {
        generatedDate = format(addDays(new Date(pattern.date), 1), 'yyyy-MM-dd');
        generatedJornada = 'dia';
      }
      const generatedTicketsData = await getTicketsByDate(generatedDate, generatedJornada);
      setGeneratedTickets(generatedTicketsData);
      const generatorSorteos = await getSorteosByDate(pattern.date);
      setSorteos(generatorSorteos);
      const generateDate = format(addDays(new Date(pattern.date), 1), 'yyyy-MM-dd');
      const generatedSorteosData = await getSorteosByDate(generateDate);
      setGeneratedSorteos(generatedSorteosData);
    } catch (error) {
      toast.error('Error al cargar Chances');
    } finally {
      setIsLoadingTickets(false);
    }
  };
  

  const handleSearch = async (date = searchDate, jornada = searchJornada) => {
    setIsLoading(true);
    try {
      const result = await searchPatterns(date, jornada);
      setPattern(result);
      await loadRedundancyData(result);
      await loadTickets(result);
    } catch (error: any) {
      if (error.response && error.response.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : 'Error al buscar patrones');
      } else {
        toast.error('No se encuentran Patrones');
      }
      setPattern(null);
      setRedundancyData([]);
      setTickets([]);
      setGeneratedTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchByNumbers = async (numbers: number[]) => {
    try {
      const results = await searchPatternsByNumbers(numbers);
      setSearchResults(results);
      setShowSearchResults(true);
      setShowSearchForm(false);
      if (results.length === 0) {
        toast.error('No se encontraron patrones que coincidan con los números proporcionados.');
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        toast.error(typeof error.response.data === 'string' ? error.response.data : 'Error al buscar patrones por números');
      } else {
        toast.error('Error al buscar patrones por números');
      }
      setSearchResults([]);
    }
  };
    const handleRedundancyClick = (pattern: Pattern) => {
      // Open in a new tab with the pattern's date and jornada
      const url = `/patrones?date=${pattern.date}&jornada=${pattern.jornada}`;
      window.open(url, '_blank');
    };

  const handleCalculate = async () => {
    if (!isAdmin) {
      toast.error('Solo los administradores pueden generar patrones');
      return;
    }
    setIsLoading(true);
    try {
      const result = await calculatePattern(searchDate, searchJornada);
      setPattern(result);
      await loadRedundancyData(result);
      await loadTickets(result);
      toast.success('Patron generado exitosamente');
    } catch (error) {
      toast.error('Error al generar patron');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (patternData: Omit<Pattern, 'id'>) => {
    try {
      await createPattern(patternData);
      toast.success('Patron creado exitosamente');
      setShowForm(false);
      handleSearch();
    } catch (error) {
      toast.error('Error al crear patron');
    }
  };

  const handleUpdate = async (patternData: Omit<Pattern, 'id'>) => {
    if (!editingPattern?.id) return;
    try {
      await updatePattern(editingPattern.id, patternData);
      toast.success('Patron actualizado exitosamente');
      setEditingPattern(null);
      handleSearch();
    } catch (error) {
      toast.error('Error al actualizar patron');
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      if (!pattern?.id) {
        toast.error('No hay patrón seleccionado para eliminar');
        return;
      }
      await deletePattern(pattern.id);
      toast.success('Patron eliminado exitosamente');
      setPattern(null);
      setRedundancyData([]);
      setTickets([]);
      setGeneratedTickets([]);
    } catch (error) {
      toast.error('Error al eliminar patron');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateRange = async (
    startDate: string,
    startJornada: string,
    endDate: string,
    endJornada: string
  ) => {
    try {
      await calculatePatternRange(startDate, startJornada, endDate, endJornada);
      toast.success('Patrones calculados exitosamente');
      setShowRangeForm(false);
      // Optionally refresh the current pattern if it falls within the calculated range
      handleSearch();
    } catch (error: any) {
      if (error.response && error.response.data && typeof error.response.data.message === 'string') {
        toast.error(error.response.data.message);
      } else if (error.response && typeof error.response.data === 'string') {
        toast.error(error.response.data);
      }
      else {
        toast.error('Error al calcular patrones en rango');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Patrones</h1>
        {isAdmin && (
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowSearchForm(true)}
              className="flex items-center gap-1 text-sm sm:text-base bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              Buscar
            </button>
            <button
              onClick={() => setShowRangeForm(true)}
              className="flex items-center gap-1 text-sm sm:text-base bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              Calcular Rango
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 text-sm sm:text-base bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              Añadir Patron
            </button>
          </div>
        )}
      </div>
  
      {showSearchResults && searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Resultados de la Búsqueda</h2>
            <button
              onClick={() => setShowSearchResults(false)}
              className="text-xs sm:text-sm bg-red-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-red-700"
            >
              Cerrar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jornada
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Números
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((pattern, index) => (
                  <tr key={index}>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
                      {new Date(pattern.date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">{pattern.jornada}</td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4">
                      <div className="flex whitespaces-nowrap gap-1">
                        {pattern.patronNumbers.map((num, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 text-center"> 
                      <button
                        onClick={() => handleRedundancyClick(pattern)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Ver detalles del patrón"
                      >
                        <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
  
      <div className="bg-white rounded-lg shadow p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-3 py-1.5 sm:px-4 sm:py-2 border rounded-md text-sm"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Jornada</label>
            <select
              value={searchJornada}
              onChange={(e) => setSearchJornada(e.target.value)}
              className="w-full px-3 py-1.5 sm:px-4 sm:py-2 border rounded-md text-sm"
              disabled={isLoading}>
              <option value="dia">Día</option>
              <option value="noche">Noche</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="flex items-center justify-center gap-1 sm:gap-2 bg-indigo-600 text-white px-3 py-1.5 sm:px-6 sm:py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed w-full text-sm"
            >
              {isLoading ? (
                <>
                  <Spinner className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Buscando...</span>
                  <span className="xs:hidden">Buscando</span>
                </>
              ) : (
                <>
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Buscar Patron</span>
                  <span className="xs:hidden">Buscar</span>
                </>
              )}
            </button>
          </div>
        </div>
  
        {!pattern && !isLoading && (
          <div className="text-center py-4 sm:py-8">
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm">No se encontraron Patrones para esos Criterios</p>
            {isAdmin && (
              <button
                onClick={handleCalculate}
                className="bg-indigo-600 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-md hover:bg-indigo-700 text-sm"
              >
                Generar Patron
              </button>
            )}
          </div>
        )}
  
        {pattern && (
          <PatternDisplay
            pattern={pattern}
            onEdit={() => setEditingPattern(pattern)}
            onDelete={handleDelete}
            showActions={isAdmin}
            redundancyData={redundancyData}
            tickets={tickets}
            generatedTickets={generatedTickets}
            isLoadingTickets={isLoadingTickets}
            sorteos={Sorteos}
            generatedSorteos={generatedSorteos}
          />
        )}
      </div>
  
      {(showForm || editingPattern) && isAdmin && (
        <PatternForm
          onSubmit={editingPattern ? handleUpdate : handleCreate}
          initialData={editingPattern || undefined}
          onCancel={() => {
            setShowForm(false);
            setEditingPattern(null);
          }}
        />
      )}
  
      {showRangeForm && isAdmin && (
        <PatternRangeForm
          onSubmit={handleCalculateRange}
          onCancel={() => setShowRangeForm(false)}
        />
      )}
      {showSearchForm && (
        <PatternSearchForm
          onSubmit={handleSearchByNumbers}
          onCancel={() => setShowSearchForm(false)}
        />
      )}
    </div>
  );
}