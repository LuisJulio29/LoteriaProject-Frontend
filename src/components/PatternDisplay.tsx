import { Pattern } from '../types';
import { Pencil, Trash2 } from 'lucide-react';

interface PatternDisplayProps {
  pattern: Pattern;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function PatternDisplay({ pattern, onEdit, onDelete, showActions = false }: PatternDisplayProps) {
  const isAdmin = localStorage.getItem('role') === '0';
  const maxValue = Math.max(...pattern.patronNumbers);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">Pattern Results</h3>
          <p className="text-sm text-gray-600">
            Date: {new Date(pattern.date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Jornada: {pattern.jornada}
          </p>
        </div>
        {showActions && isAdmin && (
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="text-indigo-600 hover:text-indigo-900"
            >
              <Pencil className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-10 gap-2">
        {pattern.patronNumbers.map((count, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-sm text-gray-600 mb-1">{index}</div>
            <div className="w-full bg-gray-100 rounded-lg relative" style={{ height: '200px' }}>
              <div
                className="absolute bottom-0 w-full bg-indigo-500 rounded-lg transition-all duration-300"
                style={{
                  height: `${(count / maxValue) * 100}%`,
                }}
              />
            </div>
            <div className="text-lg font-semibold mt-1">{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}