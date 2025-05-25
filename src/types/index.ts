export interface LoginResponse {
  isSuccess: boolean;
  token: string;
  roles: number;
}

export interface Ticket {
  id: number;
  number: string;
  date: string;
  sign: string;
  loteria: string;
  jornada: string;
}

export interface Sorteo{
  id: number;
  number: string;
  date: string;
  serie: string;
  loteria: string;
}

export interface User {
  token: string;
  role: number;
}

export interface Pattern {
  id?: number;
  date: string;
  jornada: string;
  patronNumbers: number[];
  fdg?: string[];
}

export interface PatronForVoid {
  patron: Pattern;
  redundancyNumbers: number[];
}

export interface PatronRedundancy {
  patron: Pattern;
  redundancyCount: number;
}
export interface SorteoPattern {
  id?: number;
  date: string;
  patronNumbers: number[];
}

export interface SorteoPatronRedundancy {
  sorteoPatron: SorteoPattern;
  redundancyCount: number;
}

export enum AstroSign {
  Aries = 1,
  Tauro = 2,
  Geminis = 3,
  Cancer = 4,
  Leo = 5,
  Virgo = 6,
  Libra = 7,
  Escorpio = 8,
  Sagitario = 9,
  Capricornio = 10,
  Acuario = 11,
  Piscis = 12
}

export interface AstroPatron {
  id: number;
  date: string;
  jornada: string;
  sign: AstroSign[];
  row1: number[];
  row2: number[];
  row3: number[];
  row4: number[];
  fdg?: string[];
}