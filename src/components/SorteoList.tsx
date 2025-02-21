/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Pencil, Plus, Search, RotateCw, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSorteos,createSorteo,updateSorteo,deleteSorteo,searchSorteos, } from '../services/api';
import {uploadSorteos } from '../services/api';
import { Sorteo} from '../types';
import SorteoForm from './SorteoForm';
import Spinner from './Spinner';
import React from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { es } from 'date-fns/locale';

export default function TicketList() {
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSorteo, setEditingSorteo] = useState<Sorteo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    loteria: '',
    jornada: '',
  });
  const [searchNumber, setSearchNumber] = useState('');
  const [searchSerie, setSearchSerie] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const isAdmin = localStorage.getItem('role') === '0';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSorteos = async () => {
    setIsLoading(true);
    try {
      const data = await getSorteos();
      setSorteos(data);
    } catch (error) {
      toast.error('Error al cargar los Sorteos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      const data = await getSorteos();
      setSorteos(data);
      setSearchNumber('');
      setSearchSerie('');
      toast.success('Sorteos recargados correctamente');
    } catch (error) {
      toast.error('Error al recargar los Sorteos'+ error);
    } finally {
      setIsReloading(false);
    }
  };

  useEffect(() => {
    loadSorteos();
  }, []);

  const handleSearch = async () => {
    if (!searchNumber.trim() && !searchSerie.trim()) 
      {
        toast.error('Ingrese al menos un criterio para buscar');
        return;
      }
    setIsSearching(true);
    try {
      const data = await searchSorteos( searchNumber || undefined, searchSerie || undefined);
      setSorteos(data);
    } catch (error) {
      toast.error('Busqueda fallida');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreate = async (sorteoData: Omit<Sorteo, 'id'>) => {
    setIsLoading(true);
    try {
      await createSorteo(sorteoData);
      toast.success('Sorteo Creado Correctamente');
      setShowForm(false);
      loadSorteos();
    } catch (error) {
      toast.error('Error al crear el Sorteo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (sorteoData: Omit<Sorteo, 'id'>) => {
    if (!editingSorteo) return;
    setIsLoading(true);
    try {
      await updateSorteo(editingSorteo.id, sorteoData);
      toast.success('Chance Actualizado Correctamente');
      setEditingSorteo(null);
      loadSorteos();
    } catch (error) {
      toast.error('Error al actualizar el Chance');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      await deleteSorteo(id);
      toast.success('Chance Eliminado Correctamente');
      loadSorteos();
    } catch (error) {
      toast.error('Error al eliminar el Chance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadSorteos(file);
      toast.success('Sorteos subidos exitosamente');
      handleReload(); // Refresh the ticket list after successful upload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al subir Sorteos');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredSorteos = sorteos.filter((sorteo) => {
    return (
      (!filters.date || sorteo.date.includes(filters.date)) &&
      (!filters.loteria || sorteo.loteria.toLowerCase().includes(filters.loteria.toLowerCase()))
    );
  });
   // Pagination calculations
   const totalPages = Math.ceil(filteredSorteos.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   const currentSorteos = filteredSorteos.slice(startIndex, endIndex);
 
   const handlePageChange = (page: number) => {
     setCurrentPage(page);
   };

  return (
    <div className="container mx-auto space-y-6">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Loterias</h1>
          {isAdmin && (
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Insertar
                  </>
                )}
              </button>
              <button
                onClick={() => setShowForm(true)}
                disabled={isLoading}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Añadir Sorteo
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center">
  <button
    onClick={handleReload}
    disabled={isReloading || isSearching}
    className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] justify-center"
  >
    {isReloading ? (
      <>
        <Spinner className="h-4 w-4" />
        Recargando...
      </>
    ) : (
      <>
        <RotateCw className="h-4 w-4" />
        Recargar
      </>
    )}
  </button>
  <div className="flex-1 grid grid-cols-2 gap-4">
    <input
      type="text"
      value={searchNumber}
      onChange={(e) => setSearchNumber(e.target.value)}
      placeholder="Buscar por Numero..."
      className="w-full px-4 py-2 border rounded-md min-w-[160px]"
      disabled={isSearching}
    />
     <input
      type="text"
      value={searchSerie}
      onChange={(e) => setSearchSerie(e.target.value)}
      placeholder="Buscar por serie..."
      className="w-full px-4 py-2 border rounded-md min-w-[160px]"
      disabled={isSearching}
    />
  </div>
  <button
    onClick={handleSearch}
    disabled={isSearching}
    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] justify-center"
  >
    {isSearching ? (
      <>
        <Spinner className="h-4 w-4" />
        Buscando...
      </>
    ) : (
      <>
        <Search className="h-4 w-4" />
        Buscar
      </>
    )}
  </button>
</div>

        <div className="grid grid-cols-2 gap-6">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="px-4 py-2 border rounded-md"
            disabled={isLoading}
          />
          <input
            type="text"
            value={filters.loteria}
            onChange={(e) => setFilters({ ...filters, loteria: e.target.value })}
            placeholder="Filtrar por Loteria..."
            className="px-4 py-2 border rounded-md"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Spinner className="h-8 w-8 text-indigo-600" />
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                    Numero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                    Serie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                    Loteria
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentSorteos.map((sorteo) => (
                  <tr key={sorteo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{sorteo.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{sorteo.serie}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(sorteo.date), 'dd/MM/yyyy EEEE',{ locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{sorteo.loteria}</td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingSorteo(sorteo)}
                            className="text-indigo-600 hover:text-indigo-900"
                            disabled={isLoading}
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <DeleteConfirmationModal 
                            onDelete={() => handleDelete(sorteo.id)}
                            isLoading={isLoading}
                            itemType="Chance"
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{startIndex + 1}</span>{' '}
                    hasta{' '}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredSorteos.length)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium">{filteredSorteos.length}</span>{' '}
                    resultados
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current page
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis between non-consecutive pages
                        if (index > 0 && page - array[index - 1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${page}`}>
                              <span className="px-3 py-1 text-gray-500">...</span>
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded-md ${
                                  currentPage === page
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
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md ${
                              currentPage === page
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {(showForm || editingSorteo) && (
        <SorteoForm
          onSubmit={editingSorteo ? handleUpdate : handleCreate}
          initialData={editingSorteo || undefined}
          onCancel={() => {
            setShowForm(false);
            setEditingSorteo(null);
          }}
        />
      )}
    </div>
  );
}