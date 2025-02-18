/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  searchPatterns,
  createPattern,
  updatePattern,
  deletePattern,
  calculatePattern,
  calculateRedundancy,
  getTicketsByDate,
  calculatePatternRange
} from '../services/api';
import { Pattern, PatronRedundancy } from '../types';
import PatternForm from '../components/PatternForm';
import PatternRangeForm from '../components/PatternRangeForm';
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
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redundancyData, setRedundancyData] = useState<PatronRedundancy[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
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

      // Load generated tickets
      let generatedDate = pattern.date;
      let generatedJornada = pattern.jornada;

      if (pattern.jornada.toLowerCase() === 'dia') {
        // If pattern is day, get night tickets of same day
        generatedJornada = 'noche';
      } else {
        // If pattern is night, get day tickets of next day
        generatedDate = format(addDays(new Date(pattern.date), 1), 'yyyy-MM-dd');
        generatedJornada = 'dia';
      }

      const generatedTicketsData = await getTicketsByDate(generatedDate, generatedJornada);
      setGeneratedTickets(generatedTicketsData);
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
    } catch (error) {
      toast.error('No se encuentran Patrones');
      setPattern(null);
      setRedundancyData([]);
      setTickets([]);
      setGeneratedTickets([]);
    } finally {
      setIsLoading(false);
    }
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
    if (!pattern || !window.confirm('Estás Seguro que Quieres eliminar este Patron?')) return;
    setIsLoading(true);
    try {
      await deletePattern(pattern.id!);
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
      toast.error(error.response?.data?.message || 'Error al calcular patrones');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patrones</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowRangeForm(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              Calcular Rango
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Añadir Patron
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
            <select
              value={searchJornada}
              onChange={(e) => setSearchJornada(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={isLoading}>
              <option value="dia">Día</option>
              <option value="noche">Noche</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => handleSearch()}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isLoading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Buscar Patron
                </>
              )}
            </button>
          </div>
        </div>

        {!pattern && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No se encontraron Patrones para esos Criterios</p>
            {isAdmin && (
              <button
                onClick={handleCalculate}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
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
    </div>
  );
}