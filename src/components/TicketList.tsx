import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Plus, Search, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTickets, createTicket, updateTicket, deleteTicket, searchTickets } from '../services/api';
import { Ticket } from '../types';
import TicketForm from './TicketForm';
import Spinner from './Spinner';
import React from 'react';

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    loteria: '',
    jornada: '',
  });
  const [searchNumber, setSearchNumber] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const isAdmin = localStorage.getItem('role') === '0';

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await getTickets();
      setTickets(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to load tickets');
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
      toast.success('Tickets reloaded successfully');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to reload tickets');
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
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreate = async (ticketData: Omit<Ticket, 'id'>) => {
    setIsLoading(true);
    try {
      await createTicket(ticketData);
      toast.success('Ticket created successfully');
      setShowForm(false);
      loadTickets();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to create ticket');
      setIsLoading(false);
    }
  };

  const handleUpdate = async (ticketData: Omit<Ticket, 'id'>) => {
    if (!editingTicket) return;
    setIsLoading(true);
    try {
      await updateTicket(editingTicket.id, ticketData);
      toast.success('Ticket updated successfully');
      setEditingTicket(null);
      loadTickets();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to update ticket');
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    setIsLoading(true);
    try {
      await deleteTicket(id);
      toast.success('Ticket deleted successfully');
      loadTickets();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to delete ticket');
      setIsLoading(false);
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
    <div className="container mx-auto p-14">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tickets</h1>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              disabled={isLoading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Añadir Chance
            </button>
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
        Reloading...
      </>
    ) : (
      <>
        <RotateCw className="h-4 w-4" />
        Reload
      </>
    )}
  </button>
  <div className="flex-1">
    <input
      type="text"
      value={searchNumber}
      onChange={(e) => setSearchNumber(e.target.value)}
      placeholder="Buscar por Numero..."
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
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                    Loteria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                    Jornada
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{ticket.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(ticket.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{ticket.loteria}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ticket.jornada}</td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingTicket(ticket)}
                            className="text-indigo-600 hover:text-indigo-900"
                            disabled={isLoading}
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ticket.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isLoading}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
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
                      {Math.min(endIndex, filteredTickets.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{filteredTickets.length}</span>{' '}
                    results
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
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
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
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