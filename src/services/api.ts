import axios from 'axios';
import { AstroPatron, PatronRedundancy, Pattern, Ticket,Sorteo, SorteoPattern,SorteoPatronRedundancy, PatronForVoid } from '../types';

export const baseURL = 'http://projectcataleya.runasp.net/api';

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const Register = async (userName:string, password:string) => {
  const response = await api.post('/Users/Register',{userName,password});
  return response.data;
}

export const login = async (userName: string, password: string) => {
  const response = await api.post('/Users/Login', { userName, password });
  return response.data;
};

export const getTickets = async () => {
  const response = await api.get('/tickets');
  return response.data;
};

export const getSorteos = async () => {
  const response = await api.get('/Sorteos');
  return response.data;
};

export const searchTickets = async (Number: string) => {
  const response = await api.get(`/Tickets/GetTicketByNumber/${Number}`);
  return response.data;
};

export const searchSorteos = async (Number?: string, Serie?: string) => {
  let url = '/Sorteos/GetSorteoByNumber';
  const params = new URLSearchParams();
  
  if (Number) {
      params.append('number', Number);
  }
  if (Serie) {
      params.append('serie', Serie);
  }
  const queryString = params.toString();
  if (queryString) {
      url += `?${queryString}`;
  }
  const response = await api.get(url);
  return response.data;
}
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
export const getSorteosByDate = async (date: string) => {
  try {
    const response = await api.get('/Sorteos/GetsorteoByDate', {
      params: {
        date
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting sorteo by date:', error);
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

export const createSorteo = async (sorteo: Omit<Sorteo, 'id'>) => {
  const response = await api.post('/Sorteos', sorteo);
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

export const updateSorteo = async (id: number, sorteo: Omit<Sorteo, 'id'>) => {
  const sorteoWithId = {
    id: id,
    ...sorteo
  };
  const response = await api.put(`/Sorteos/${id}`, sorteoWithId);
  return response.data;
};

export const deleteTicket = async (id: number) => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};

export const deleteSorteo = async (id: number) => {
  const response = await api.delete(`/Sorteos/${id}`);
  return response.data;
};

// Pattern endpoints
export const searchPatternsByNumbers = async (numbers: number[]): Promise<Pattern[]> => {
  try {
    const response = await api.post('/Patrons/GetPatronByNumbers', numbers);
    return response.data;
  } catch (error) {
    console.error('Error searching patterns by numbers:', error);
    throw error;
  }
};

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

export const SearchSorteoPatterns = async(date:string): Promise<SorteoPattern> =>
{
  try{
    const response = await api.get('/SorteoPatrons/Search',{
      params:{
        date:date
      }
    });
    return response.data;
  }catch(error){
    console.error('Error searching Sorteo Patterns:',error);
    throw error;
  }
}

export const createPattern = async (pattern: Omit<Pattern, 'id'>) => {
  const response = await api.post('/patrons', pattern);
  return response.data;
};

export const createSorteoPattern = async (sorteoPattern: Omit<SorteoPattern, 'id'>) => {
  const response = await api.post('/SorteoPatrons', sorteoPattern);
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

export const updateSorteoPattern = async (id: number, sorteoPattern: Omit<SorteoPattern, 'id'>) => {
  const sorteoPatternWithId = {
    id: id,
    ...sorteoPattern
  };
  const response = await api.put(`/SorteoPatrons/${id}`, sorteoPatternWithId);
  return response.data;
}

export const deletePattern = async (id: number) => {
  const response = await api.delete(`/patrons/${id}`);
  return response.data;
};

export const deleteSorteoPattern = async (id: number) => {
  const response = await api.delete(`/SorteoPatrons/${id}`);
  return response.data;
}

export const calculatePattern = async (date: string, jornada: string): Promise<Pattern> => {
  try {
    const response = await api.post(`/patrons/Calculate?date=${date}&jornada=${jornada}`);
    return response.data;
  } catch (error) {
    console.error('Error calculating pattern:', error);
    throw error;
  }
};

export const calculateSorteoPattern = async (date: string): Promise<SorteoPattern> => {
  try {
    const response = await api.post(`/SorteoPatrons/Calculate?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error calculating sorteo pattern:', error);
    throw error;
  }
}

export const calculateRedundancy = async (pattern: Pattern): Promise<PatronRedundancy[]> => {
  try {
    const response = await api.post('/patrons/CalculateRedundancy', pattern);
    return response.data;
  } catch (error) {
    console.error('Error calculating redundancy:', error);
    throw error;
  }
};

export const calculateSorteoRedundancy = async (sorteoPattern: SorteoPattern): Promise<SorteoPatronRedundancy[]> => {
  try {
    const response = await api.post('/sorteopatrons/CalculateRedundancy', sorteoPattern);
    return response.data;
  } catch (error) {
    console.error('Error calculating sorteo redundancy:', error);
    throw error;
  }
}

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

export const getSorteoRedundancyInDate = async (date: string): Promise<SorteoPattern[]> => {
  try {
    const response = await api.get('/SorteoPatrons/GetRedundancyinDate', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting redundancy in date:', error);
    throw error;
  }
}

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

export const getSorteoNumbersNotPlayed = async (date: string): Promise<string[]> => {
  try {
    const response = await api.get('/SorteoPatrons/GetNumbersNotPlayed', {
      params: { date }
    });
    return response.data;
  }
  catch (error) {
    console.error('Error getting numbers not played:', error);
    throw error;
  }
}
export const getVoidInDay = async (id: number): Promise<PatronForVoid[]> => {
  try {
    const response = await api.get(`/patrons/GetVoidinDay/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting void in day:', error);
    throw error;
  }
};

export const getSorteoVoidInDay = async (id: number): Promise<SorteoPattern[]> => {
  try {
    const response = await api.get(`/SorteoPatrons/GetVoidinDay/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting void in day:', error);
    throw error;
  }
}

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
export const uploadSorteos = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await api.post('/sorteos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading sorteos:', error);
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

export const calculateSorteoPatternRange = async (startDate: string, endDate: string) => {
  try {
    const response = await api.post(`/SorteoPatrons/CalculateRange?dateInit=${startDate}&dateFinal=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error calculating sorteo pattern range:', error);
    throw error;
  }
}

export const getTotalForColumn = async (date: string, jornada: string): Promise<number[]> => {
  try {
    const response = await api.get('/patrons/GetTotalForColumn', {
      params: { date, jornada }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting total for column:', error);
    throw error;
  }
};

export const getSorteoTotalForColumn = async (date: string): Promise<number[]> => {
  try {
    const response = await api.get('/SorteoPatrons/GetTotalForColumn', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting total for column:', error);
    throw error;
  }
}