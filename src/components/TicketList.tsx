import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTickets, createTicket, updateTicket, deleteTicket, searchTickets } from '../services/api';
import { Ticket } from '../types';
import TicketForm from './TicketForm';

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [filters, setFilters] = useState({
    date: '',
    loteria: '',
    jornada: '',
  });
  const [searchNumber, setSearchNumber] = useState('');
  const isAdmin = localStorage.getItem('role') === '0';

  const loadTickets = async () => {
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      toast.error('Failed to load tickets');
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSearch = async () => {
    if (!searchNumber.trim()) return;
    try {
      const data = await searchTickets(searchNumber);
      setTickets(data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleCreate = async (ticketData: Omit<Ticket, 'id'>) => {
    try {
      await createTicket(ticketData);
      toast.success('Ticket created successfully');
      setShowForm(false);
      loadTickets();
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleUpdate = async (ticketData: Omit<Ticket, 'id'>) => {
    if (!editingTicket) return;
    try {
      await updateTicket(editingTicket.id, ticketData);
      toast.success('Ticket updated successfully');
      setEditingTicket(null);
      loadTickets();
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await deleteTicket(id);
      toast.success('Ticket deleted successfully');
      loadTickets();
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    return (
      (!filters.date || ticket.date.includes(filters.date)) &&
      (!filters.loteria || ticket.loteria.toLowerCase().includes(filters.loteria.toLowerCase())) &&
      (!filters.jornada || ticket.jornada.toLowerCase().includes(filters.jornada.toLowerCase()))
    );
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tickets</h1>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Add Ticket
            </button>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              placeholder="Search by number..."
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="px-4 py-2 border rounded-md"
          />
          <input
            type="text"
            value={filters.loteria}
            onChange={(e) => setFilters({ ...filters, loteria: e.target.value })}
            placeholder="Filter by Loteria..."
            className="px-4 py-2 border rounded-md"
          />
          <input
            type="text"
            value={filters.jornada}
            onChange={(e) => setFilters({ ...filters, jornada: e.target.value })}
            placeholder="Filter by Jornada..."
            className="px-4 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loteria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jornada
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTickets.map((ticket) => (
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
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="text-red-600 hover:text-red-900"
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