/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { format } from 'date-fns';
import { Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAstroPatronByDate,
  calculateAstroPatron,
  getAstroTicketsByDate
} from '../services/api';
import { AstroPatron, AstroSign } from '../types';
import Spinner from '../components/Spinner';

export default function AstroPage() {
  const [searchDate, setSearchDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchJornada, setSearchJornada] = useState('dia');
  const [astroPatron, setAstroPatron] = useState<AstroPatron | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const [ticketsData, patronData] = await Promise.all([
        getAstroTicketsByDate(searchDate, searchJornada),
        getAstroPatronByDate(searchDate, searchJornada)
      ]);
      setTickets(ticketsData);
      setAstroPatron(patronData);
    } catch (error) {
      toast.error('Patron no Encontrado');
      setAstroPatron(null);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const patronData = await calculateAstroPatron(searchDate, searchJornada);
      const ticketsData = await getAstroTicketsByDate(searchDate, searchJornada);
      setAstroPatron(patronData);
      setTickets(ticketsData);
      toast.success('Patron Calculado Exitosamente');
    } catch (error) {
      toast.error('Error al calcular el patron');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const patronData = await calculateAstroPatron(searchDate, searchJornada);
      const ticketsData = await getAstroTicketsByDate(searchDate, searchJornada);
      setAstroPatron(patronData);
      setTickets(ticketsData);
      toast.success('Patron Generado Exitosamente');
    } catch (error) {
      toast.error('Error al generar el patron');
    } finally {
      setIsRegenerating(false);
    }
  };

  const getColorIntensity = (value: number, maxValue: number) => {
    const minHue = 200; // Blue
    const maxHue = 170; // Teal
    const hue = maxHue - ((value / maxValue) * (maxHue - minHue));
    return `hsla(${hue}, 70%, 90%, ${0.3 + (value / maxValue) * 0.7})`;
  };

  const renderFrequencyTable = () => {
    if (!astroPatron) return null;

    const allValues = [
      ...astroPatron.row1,
      ...astroPatron.row2,
      ...astroPatron.row3,
      ...astroPatron.row4
    ];
    const maxValue = Math.max(...allValues);

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Frecuencia de Numeros</h3>
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 bg-gray-50 border">Fila/Numero</th>
              {Array.from({ length: 10 }, (_, i) => (
                <th key={i} className="px-4 py-2 bg-gray-50 border text-center w-16">{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Fila 1', data: astroPatron.row1 },
              { name: 'Fila 2', data: astroPatron.row2 },
              { name: 'Fila 3', data: astroPatron.row3 },
              { name: 'Fila 4', data: astroPatron.row4 },
            ].map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 font-medium bg-gray-50 border">{row.name}</td>
                {row.data.map((count, i) => (
                  <td
                    key={i}
                    className="px-4 py-2 text-center border transition-colors duration-200"
                    style={{
                      backgroundColor: getColorIntensity(count, maxValue),
                    }}
                  >
                    {count}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderZodiacChart = () => {
    if (!astroPatron) return null;

    const zodiacSigns = Object.entries(AstroSign)
      .filter(([key]) => isNaN(Number(key)))
      .map(([key], index) => ({
        name: key,
        count: astroPatron.sign[index]
      }));

    const maxValue = Math.max(...astroPatron.sign);

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Frecuencia de Signo Zodiacal </h3>
        <div className="grid grid-cols-6 gap-2">
          {zodiacSigns.map((sign) => (
            <div key={sign.name} className="flex flex-col items-center">
              <div className="text-sm text-gray-600 mb-1">{sign.name}</div>
              <div className="w-3/4 bg-gray-100 rounded-lg relative" style={{ height: '200px' }}>
                <div
                  className="absolute bottom-0 w-full bg-indigo-500 rounded-lg transition-all duration-300"
                  style={{
                    height: `${(sign.count / (maxValue || 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="text-lg font-semibold mt-1">{sign.count}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Patron Astro</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jornada</label>
            <select
              value={searchJornada}
              onChange={(e) => setSearchJornada(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={isLoading}
            >
              <option value="dia">Sol</option>
              <option value="noche">Luna</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              {isLoading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Buscar Patron
                </>
              )}
            </button>
          </div>
        </div>

        {!astroPatron && !isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No se encontró ningun patron de Astro para ese mes</p>
            <button
              onClick={handleCalculate}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
            >
              Generar Patron de Astro
            </button>
          </div>
        )}

        {tickets.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">Chances</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loteria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jornada
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{ticket.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ticket.sign}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(ticket.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{ticket.loteria}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{ticket.jornada}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {astroPatron && (
          <>
            {renderFrequencyTable()}
            {renderZodiacChart()}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegenerating ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Regenerando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    ReGenerar Patron Astro
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}