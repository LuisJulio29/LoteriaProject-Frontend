import axios from 'axios';

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

export const login = async (username: string, password: string) => {
  const response = await api.post('/Login', { username, password });
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

export const createTicket = async (ticket: Omit<Ticket, 'id'>) => {
  const response = await api.post('/tickets', ticket);
  return response.data;
};

export const updateTicket = async (id: number, ticket: Omit<Ticket, 'id'>) => {
  const response = await api.put(`/tickets/${id}`, ticket);
  return response.data;
};

export const deleteTicket = async (id: number) => {
  const response = await api.delete(`/tickets/${id}`);
  return response.data;
};