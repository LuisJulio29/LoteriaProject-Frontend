export interface LoginResponse {
  isSuccess: boolean;
  token: string;
  roles: number;
}

export interface Ticket {
  id: number;
  number: string;
  date: string;
  loteria: string;
  jornada: string;
}

export interface User {
  token: string;
  role: number;
}