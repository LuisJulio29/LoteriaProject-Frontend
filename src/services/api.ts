import axios from 'axios';
import { AstroPatron, PatronRedundancy, Pattern, Ticket } from '../types';

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

export const searchTickets = async (Number: string) => {
  const response = await api.get(`/Tickets/GetTicketByNumber/${Number}`);
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
export const getAstroTicketsByDate = async (date: string, jornada: string) => {
  try {
    const response = await api.get('/Tickets/GetAstroTicketByDate', {
      params: {
        date,
        jornada
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting astro tickets by date:', error);
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

export const getAstroPatronByDate = async (date: string, jornada: string): Promise<AstroPatron> => {
  try {
    const response = await api.get('/AstroPatrons/GetAstroPatronByDate', {
      params: {
        date,
        jornada
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting astro patron:', error);
    throw error;
  }
};

export const calculateAstroPatron = async (date: string, jornada: string): Promise<AstroPatron> => {
  try {
    const response = await api.post(`/AstroPatrons/Calculate?date=${date}&jornada=${jornada}`);
    return response.data;
  } catch (error) {
    console.error('Error calculating astro patron:', error);
    throw error;
  }
};

export const getRedundancyInDate = async (date: string): Promise<Pattern[]> => {
  try {
    const response = await api.get('/patrons/GetRedundancyinDate', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting redundancy in date:', error);
    throw error;
  }
};

export const getNumbersNotPlayed = async (date: string, jornada: string): Promise<string[]> => {
  try {
    const response = await api.get('/patrons/GetNumbersNotPlayed', {
      params: { date, jornada }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting numbers not played:', error);
    throw error;
  }
};

export const getVoidInDay = async (id: number): Promise<Pattern[]> => {
  try {
    const response = await api.get(`/patrons/GetVoidinDay/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting void in day:', error);
    throw error;
  }
};

export const uploadTickets = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await api.post('/Tickets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading tickets:', error);
    throw error;
  }
};

export const calculatePatternRange = async (
  startDate: string,
  startJornada: string,
  endDate: string,
  endJornada: string
) => {
  try {
    const response = await api.post(`/patrons/CalculateRange?dateInit=${startDate}&jornadaInit=${startJornada}&dateFinal=${endDate}&jornadaFinal=${endJornada}`);
    return response.data;
  } catch (error) {
    console.error('Error calculating pattern range:', error);
    throw error;
  }
};