import axios from 'axios';
import { PatronRedundancy, Pattern, Ticket } from '../types';

const api = axios.create({
  baseURL: 'https://localhost:7267/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (userName: string, password: string) => {
  const response = await api.post('/Users/Login', { userName, password });
  return response.data;
};

export const getTickets = async () => {
  const response = await api.get('/tickets');
  return response.data;
};

export const searchTickets = async (id: string) => {
  const response = await api.get(`/Tickets/${id}`);
  return response.data;
};

export const getTicketsByDate = async (date: string, jornada: string) => {
  try {
    const response = await api.get('/Tickets/GetTicketByDate', {
      params: {
        date,
        jornada
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting tickets by date:', error);
    throw error;
  }
};

export const createTicket = async (ticket: Omit<Ticket, 'id'>) => {
  const response = await api.post('/tickets', ticket);
  return response.data;
};

export const updateTicket = async (id: number, ticket: Omit<Ticket, 'id'>) => {
  const ticketWithId = {
    id: id,
    ...ticket
  };
  const response = await api.put(`/tickets/${id}`, ticketWithId);
  return response.data;
};

export const updatePattern = async (id: number, pattern: Omit<Pattern, 'id'>) => {
  const patternWithId = {
    id: id,
    ...pattern
  };
  const response = await api.put(`/patrons/${id}`, patternWithId);
  return response.data;
};

export const deleteTicket = async (id: number) => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};

// Pattern endpoints
export const searchPatterns = async (date: string, jornada: string): Promise<Pattern> => {
  try {
    const response = await api.get('/patrons/Search', {
      params: {
        date: date,
        jornada: jornada 
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching patterns:', error);
    throw error;
  }
};

export const createPattern = async (pattern: Omit<Pattern, 'id'>) => {
  const response = await api.post('/patrons', pattern);
  return response.data;
};


export const deletePattern = async (id: number) => {
  const response = await api.delete(`/patrons/${id}`);
  return response.data;
};

export const calculatePattern = async (date: string, jornada: string): Promise<Pattern> => {
  try {
    const response = await api.post(`/patrons/Calculate?date=${date}&jornada=${jornada}`);
    return response.data;
  } catch (error) {
    console.error('Error calculating pattern:', error);
    throw error;
  }
};

export const calculateRedundancy = async (pattern: Pattern): Promise<PatronRedundancy[]> => {
  try {
    const response = await api.post('/patrons/CalculateRedundancy', pattern);
    return response.data;
  } catch (error) {
    console.error('Error calculating redundancy:', error);
    throw error;
  }
};