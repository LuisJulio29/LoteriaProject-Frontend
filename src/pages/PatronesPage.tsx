/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { searchPatterns, createPattern, updatePattern, deletePattern, calculatePattern } from '../services/api';
import { Pattern } from '../types';
import PatternForm from '../components/PatternForm';
import PatternDisplay from '../components/PatternDisplay';
import Spinner from '../components/Spinner';

export default function PatronesPage() {
  const [searchDate, setSearchDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchJornada, setSearchJornada] = useState('dia');
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPattern, setEditingPattern] = useState<Pattern | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = localStorage.getItem('role') === '0';

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const result = await searchPatterns(searchDate, searchJornada);
      setPattern(result);
    } catch (error) {
      toast.error('No pattern found');
      setPattern(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can calculate patterns');
      return;
    }
    setIsLoading(true);
    try {
      const result = await calculatePattern(searchDate, searchJornada);
      setPattern(result);
      toast.success('Pattern calculated successfully');
    } catch (error) {
      toast.error('Failed to calculate pattern');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (patternData: Omit<Pattern, 'id'>) => {
    try {
      await createPattern(patternData);
      toast.success('Pattern created successfully');
      setShowForm(false);
      handleSearch();
    } catch (error) {
      toast.error('Failed to create pattern');
    }
  };

  const handleUpdate = async (patternData: Omit<Pattern, 'id'>) => {
    if (!editingPattern?.id) return;
    try {
      await updatePattern(editingPattern.id, patternData);
      toast.success('Pattern updated successfully');
      setEditingPattern(null);
      handleSearch();
    } catch (error) {
      toast.error('Failed to update pattern');
    }
  };

  const handleDelete = async () => {
    if (!pattern || !window.confirm('Are you sure you want to delete this pattern?')) return;
    setIsLoading(true);
    try {
      await deletePattern(pattern.id!);
      toast.success('Pattern deleted successfully');
      setPattern(null);
    } catch (error) {
      toast.error('Failed to delete pattern');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patrones</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Pattern
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
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
              disabled={isLoading}
            >
              <option value="dia">Día</option>
              <option value="noche">Noche</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isLoading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Pattern
                </>
              )}
            </button>
          </div>
        </div>

        {!pattern && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No pattern found for the selected criteria</p>
            {isAdmin && (
              <button
                onClick={handleCalculate}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Generate Pattern
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
    </div>
  );
}