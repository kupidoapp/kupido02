import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Filters {
  gender: string;
  minAge: number;
  maxAge: number;
  province: string;
  lookingFor: string;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const PROVINCES = [
  'Todas', 'Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete',
  'Zambezia', 'Nampula', 'Cabo Delgado', 'Niassa'
];

const GENDERS = [
  { value: '', label: 'Todos' },
  { value: 'Masculino', label: 'Homens' },
  { value: 'Feminino', label: 'Mulheres' },
];

const LOOKING_FOR = [
  { value: '', label: 'Todos' },
  { value: 'Namoro sério', label: 'Namoro sério' },
  { value: 'Amizade', label: 'Amizade' },
  { value: 'Algo casual', label: 'Algo casual' },
];

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}) => {
  const handleChange = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      gender: '',
      minAge: 18,
      maxAge: 50,
      province: '',
      lookingFor: '',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-kupido-card rounded-t-3xl z-50 slide-up max-h-[85vh] overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-pink" />
              <h2 className="text-xl font-semibold text-white">Filtros</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-kupido-input rounded-full flex items-center justify-center text-kupido-text-secondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Gender filter */}
          <div className="mb-6">
            <label className="block text-kupido-text-secondary text-sm mb-3">Mostrar</label>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => handleChange('gender', g.value)}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filters.gender === g.value
                      ? 'gradient-bg text-white'
                      : 'bg-kupido-input text-kupido-text-secondary hover:bg-kupido-card'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age range */}
          <div className="mb-6">
            <label className="block text-kupido-text-secondary text-sm mb-3">
              Idade: {filters.minAge} - {filters.maxAge} anos
            </label>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-kupido-text-muted">Mínima</span>
                <input
                  type="range"
                  min={18}
                  max={70}
                  value={filters.minAge}
                  onChange={(e) => handleChange('minAge', parseInt(e.target.value))}
                  className="w-full h-2 bg-kupido-input rounded-lg appearance-none cursor-pointer accent-pink"
                />
              </div>
              <div>
                <span className="text-xs text-kupido-text-muted">Máxima</span>
                <input
                  type="range"
                  min={18}
                  max={70}
                  value={filters.maxAge}
                  onChange={(e) => handleChange('maxAge', parseInt(e.target.value))}
                  className="w-full h-2 bg-kupido-input rounded-lg appearance-none cursor-pointer accent-pink"
                />
              </div>
            </div>
          </div>

          {/* Province */}
          <div className="mb-6">
            <label className="block text-kupido-text-secondary text-sm mb-3">Província</label>
            <select
              value={filters.province}
              onChange={(e) => handleChange('province', e.target.value)}
              className="w-full p-3 rounded-xl bg-kupido-input text-white border-transparent focus:border-pink focus:ring-pink/20 outline-none"
            >
              {PROVINCES.map((p) => (
                <option key={p} value={p === 'Todas' ? '' : p} className="bg-kupido-card">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Looking for */}
          <div className="mb-8">
            <label className="block text-kupido-text-secondary text-sm mb-3">Procurando por</label>
            <div className="flex flex-wrap gap-2">
              {LOOKING_FOR.map((l) => (
                <button
                  key={l.value}
                  onClick={() => handleChange('lookingFor', l.value)}
                  className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                    filters.lookingFor === l.value
                      ? 'gradient-bg text-white'
                      : 'bg-kupido-input text-kupido-text-secondary hover:bg-kupido-card'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={resetFilters}
              variant="outline"
              className="flex-1 border-kupido-input text-kupido-text-secondary hover:bg-kupido-input"
            >
              Limpar
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 gradient-bg hover:opacity-90 text-white font-semibold rounded-full btn-shadow"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;
