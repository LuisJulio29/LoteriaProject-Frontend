/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import {SearchSorteoPatterns,createSorteoPattern,updateSorteoPattern,deleteSorteoPattern,calculateSorteoPattern,calculateSorteoRedundancy,calculateSorteoPatternRange,getSorteosByDate} from '../services/api';
import { SorteoPattern, SorteoPatronRedundancy } from '../types';
import SorteoPatternForm from '../components/SorteoPatternForm';
import SorteoPatternRange from '../components/SorteoPatternRange';
import SorteoPatternDisplay from '../components/SorteoPatternDisplay';
import Spinner from '../components/Spinner';
import { useSearchParams } from 'react-router-dom';

export default function PatronesPage() {
  const [searchParams] = useSearchParams();
  const [searchDate, setSearchDate] = useState(searchParams.get('date') || format(new Date(), 'yyyy-MM-dd'));
  const [SorteoPattern, setSorteoPattern] = useState<SorteoPattern | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showRangeForm, setShowRangeForm] = useState(false);
  const [editingPattern, setEditingPattern] = useState<SorteoPattern | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [redundancyData, setRedundancyData] = useState<SorteoPatronRedundancy[]>([]);
  const [Sorteos, setSorteos] = useState<any[]>([]);
  const [generatedSorteos, setGeneratedSorteos] = useState<any[]>([]);
  const [isLoadingSorteos, setIsLoadingSorteos] = useState(false);
  const isAdmin = localStorage.getItem('role') === '0';

  // Effect to handle URL parameters
  useEffect(() => {
    const dateParam = searchParams.get('date');
    
    if (dateParam) {
      setSearchDate(dateParam);
      handleSearch(dateParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadRedundancyData = async (SorteoPattern: SorteoPattern) => {
    try {
      const data = await calculateSorteoRedundancy(SorteoPattern);
      setRedundancyData(data);
    } catch (error) {
      toast.error('Error al cargar datos de redundancia');
    }
  };

  const loadSorteos = async (SorteoPattern: SorteoPattern) => {
    setIsLoadingSorteos(true);
    try {
      const generatorSorteos = await getSorteosByDate(SorteoPattern.date);
      setSorteos(generatorSorteos);
      const generatedDate = format(addDays(new Date(SorteoPattern.date), 1), 'yyyy-MM-dd');
      const generatedSorteosData = await getSorteosByDate(generatedDate);
      setGeneratedSorteos(generatedSorteosData);
    } catch (error) {
      toast.error('Error al cargar Chances');
    } finally {
      setIsLoadingSorteos(false);
    }
  };

  const handleSearch = async (date = searchDate) => {
    setIsLoading(true);
    try {
      const result = await SearchSorteoPatterns(date);
      setSorteoPattern(result);
      await loadRedundancyData(result);
      await loadSorteos(result);
    } catch (error) {
      toast.error('No se encuentran Patrones');
      setSorteoPattern(null);
      setRedundancyData([]);
      setSorteos([]);
      setGeneratedSorteos([]);
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
      const result = await calculateSorteoPattern(searchDate);
      setSorteoPattern(result);
      await loadRedundancyData(result);
      await loadSorteos(result);
      toast.success('Patron generado exitosamente');
    } catch (error) {
      toast.error('Error al generar patron');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (SorteopatternData: Omit<SorteoPattern, 'id'>) => {
    try {
      await createSorteoPattern(SorteopatternData);
      toast.success('Patron creado exitosamente');
      setShowForm(false);
      handleSearch();
    } catch (error) {
      toast.error('Error al crear patron');
    }
  };

  const handleUpdate = async (SorteoPattern: Omit<SorteoPattern, 'id'>) => {
    if (!editingPattern?.id) return;
    try {
      await updateSorteoPattern(editingPattern.id, SorteoPattern);
      toast.success('Patron actualizado exitosamente');
      setEditingPattern(null);
      handleSearch();
    } catch (error) {
      toast.error('Error al actualizar patron');
    }
  };

  const handleDelete = async () => {
    if (!SorteoPattern || !window.confirm('Estás Seguro que Quieres eliminar este Patron?')) return;
    setIsLoading(true);
    try {
      await deleteSorteoPattern(SorteoPattern.id!);
      toast.success('Patron eliminado exitosamente');
      setSorteoPattern(null);
      setRedundancyData([]);
      setSorteos([]);
      setGeneratedSorteos([]);
    } catch (error) {
      toast.error('Error al eliminar patron');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculateRange = async (startDate: string,endDate: string,
  ) => {
    try {
      await calculateSorteoPatternRange(startDate, endDate);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

        {!SorteoPattern && !isLoading && (
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

        {SorteoPattern && (
          <SorteoPatternDisplay
            Sorteopattern={SorteoPattern}
            onEdit={() => setEditingPattern(SorteoPattern)}
            onDelete={handleDelete}
            showActions={isAdmin}
            redundancyData={redundancyData}
            Sorteos={Sorteos}
            generatedSorteos={generatedSorteos}
            isLoadingSorteos={isLoadingSorteos}
          />
        )}
      </div>

      {(showForm || editingPattern) && isAdmin && (
        <SorteoPatternForm
          onSubmit={editingPattern ? handleUpdate : handleCreate}
          initialData={editingPattern || undefined}
          onCancel={() => {
            setShowForm(false);
            setEditingPattern(null);
          }}
        />
      )}

      {showRangeForm && isAdmin && (
        <SorteoPatternRange
          onSubmit={handleCalculateRange}
          onCancel={() => setShowRangeForm(false)}
        />
      )}
    </div>
  );
}