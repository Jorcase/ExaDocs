import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { X, Search } from 'lucide-react';

interface Career {
  id: number;
  nombre?: string;
  codigo?: string;
}

interface CarreraMultiselectProps {
  carreras: Career[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  multiple?: boolean;
  excludeIds?: number[];
}

export default function CarreraMultiselect({
  carreras,
  selectedIds,
  onChange,
  placeholder = "Buscar y agregar carrera...",
  multiple = true,
  excludeIds = [],
}: CarreraMultiselectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter out any excluded IDs
  const availableOptions = carreras.filter(c => !excludeIds.includes(c.id));

  // Options that match search query and are NOT already selected
  const filteredOptions = availableOptions.filter(c => {
    const matchesSearch = c.nombre?.toLowerCase().includes(search.toLowerCase()) || 
                          c.codigo?.toLowerCase().includes(search.toLowerCase());
    const isAlreadySelected = selectedIds.includes(c.id);
    return matchesSearch && !isAlreadySelected;
  });

  const selectedCareers = carreras.filter(c => selectedIds.includes(c.id));

  const handleSelect = (id: number) => {
    if (multiple) {
      onChange([...selectedIds, id]);
    } else {
      onChange([id]);
    }
    setSearch('');
    setIsOpen(false);
  };

  const handleRemove = (id: number) => {
    onChange(selectedIds.filter(selectedId => selectedId !== id));
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-2">
      {/* Selected Items Badges */}
      {selectedCareers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-1.5 border border-dashed border-border/80 rounded-xl bg-muted/20">
          {selectedCareers.map((c) => (
            <div
              key={c.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted/60 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium select-none border border-border"
            >
              <span>{c.nombre}</span>
              <button
                type="button"
                className="hover:bg-muted-foreground/10 p-0.5 rounded-full transition-colors text-muted-foreground"
                onClick={() => handleRemove(c.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container (only show search input if multiple is true, OR if multiple is false and nothing is selected) */}
      {(multiple || selectedIds.length === 0) && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="pl-9 rounded-xl pr-4"
          />
        </div>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (search.length > 0 || filteredOptions.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-xl border border-border shadow-xl max-h-60 overflow-y-auto custom-scrollbar p-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((carrera) => (
              <button
                key={carrera.id}
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-left rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                onClick={() => handleSelect(carrera.id)}
              >
                <span>{carrera.nombre}</span>
                {carrera.codigo && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-mono">
                    {carrera.codigo}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              No se encontraron carreras
            </div>
          )}
        </div>
      )}
    </div>
  );
}
