import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Pencil, Plus, Search, RotateCw, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTickets, createTicket, updateTicket, deleteTicket, searchTickets, uploadTickets } from '../services/api';
import { Ticket } from '../types';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import TicketForm from './TicketForm';
import Spinner from './Spinner';
import React from 'react';
import { es } from 'date-fns/locale'

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const isAdmin = localStorage.getItem('role') === '0';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await getTickets();
      setTickets(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Error al cargar los tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    try {
      const data = await getTickets();
      setTickets(data);
      setSearchNumber('');
      toast.success('Chances recargados correctamente');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Error al recargar los Chances');
    } finally {
      setIsReloading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSearch = async () => {
    if (!searchNumber.trim()) return;
    setIsSearching(true);
    try {
      const data = await searchTickets(searchNumber);
      setTickets(data);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Busqueda fallida');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreate = async (ticketData: Omit<Ticket, 'id'>) => {
    setIsLoading(true);
    try {
      await createTicket(ticketData);
      toast.success('Chance Creado Correctamente');
      setShowForm(false);
      loadTickets();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Error al crear el Chance');
      setIsLoading(false);
    }
  };

  const handleUpdate = async (ticketData: Omit<Ticket, 'id'>) => {
    if (!editingTicket) return;
    setIsLoading(true);
    try {
      await updateTicket(editingTicket.id, ticketData);
      toast.success('Chance Actualizado Correctamente');
      setEditingTicket(null);
      loadTickets();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Error al actualizar el Chance');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      await deleteTicket(id);
      toast.success('Chance Eliminado Correctamente');
      loadTickets();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      await uploadTickets(file);
      toast.success('Tickets subidos exitosamente');
      handleReload(); // Refresh the ticket list after successful upload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al subir tickets');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    return (
      (!filters.date || ticket.date.includes(filters.date)) &&
      (!filters.loteria || ticket.loteria.toLowerCase().includes(filters.loteria.toLowerCase())) &&
      (!filters.jornada || ticket.jornada.toLowerCase().includes(filters.jornada.toLowerCase()))
    );
  });
   // Pagination calculations
   const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   const currentTickets = filteredTickets.slice(startIndex, endIndex);
 
   const handlePageChange = (page: number) => {
     setCurrentPage(page);
   };

  return (
    <div className="container mx-auto space-y-6">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Chances</h1>
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
                Añadir Chance
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center">
  <button
    onClick={handleReload}
    disabled={isReloading || isSearching}
    className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px] justify-center"
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
  <div className="flex-1">
    <input
      type="text"
      value={searchNumber}
      onChange={(e) => setSearchNumber(e.target.value)}
      placeholder="Buscar por Numero..."
      className="w-full px-4 py-2 border rounded-md min-w-[190px]"
      disabled={isSearching}
    />
  </div>
  <button
    onClick={handleSearch}
    disabled={isSearching}
    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px] justify-center"
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

        <div className="grid grid-cols-3 gap-4">
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
          <input
            type="text"
            value={filters.jornada}
            onChange={(e) => setFilters({ ...filters, jornada: e.target.value })}
            placeholder="Filtrar por Jornada..."
            className="px-4 py-2 border rounded-md"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner className="h-8 w-8 text-indigo-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                        Numero
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                        Loteria
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                        Jornada
                      </th>
                      {isAdmin && (
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                          Acciones
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">{ticket.number} {ticket.sign}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          {format(new Date(ticket.date), 'EEEE dd/MM/yyyy',{ locale: es })}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">{ticket.loteria}</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">{ticket.jornada}</td>
                        {isAdmin && (
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingTicket(ticket)}
                                className="text-indigo-600 hover:text-indigo-900"
                                disabled={isLoading}
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <DeleteConfirmationModal 
                                onDelete={() => handleDelete(ticket.id)}
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
              </div>
            </div>

            {/* Pagination */}
            <div className="px-2 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-200 mt-3 sm:mt-4 gap-2">
              <div className="text-xs sm:text-sm text-gray-700">
                <span className="font-medium">{startIndex + 1}</span> hasta{' '}
                <span className="font-medium">
                  {Math.min(endIndex, filteredTickets.length)}
                </span>{' '}de{' '}
                <span className="font-medium">{filteredTickets.length}</span> resultados
              </div>
              <div className="flex gap-1 sm:gap-2 justify-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center p-1.5 sm:px-3 sm:py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Anterior</span>
                </button>
                
                <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= (isMobile ? 1 : 4)
                      );
                    })
                    .map((page, index, array) => {
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-1.5 sm:px-3 py-1 text-gray-500 text-xs sm:text-sm">...</span>
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`w-6 h-6 sm:w-8 sm:h-8 sm:px-3 sm:py-1 flex items-center justify-center rounded-md text-xs sm:text-sm ${
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
                          className={`w-6 h-6 sm:w-8 sm:h-8 sm:px-3 sm:py-1 flex items-center justify-center rounded-md text-xs sm:text-sm ${
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
                  className="flex items-center justify-center p-1.5 sm:px-3 sm:py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Página siguiente"
                >
                  <span className="hidden sm:inline mr-1">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {(showForm || editingTicket) && (
        <TicketForm
          onSubmit={editingTicket ? handleUpdate : handleCreate}
          initialData={editingTicket || undefined}
          onCancel={() => {
            setShowForm(false);
            setEditingTicket(null);
          }}
        />
      )}
    </div>
  );
}