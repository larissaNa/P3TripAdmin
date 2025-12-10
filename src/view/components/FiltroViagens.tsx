/**
 * View Component - FiltroViagens
 * Componente de filtro e busca de viagens
 */

import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';

interface Filtros {
  destino: string;
  precoMin: string;
  precoMax: string;
  palavraChave: string;
}

interface FiltroViagensProps {
  filtros: Filtros;
  onFiltroChange: (filtros: Partial<Filtros>) => void;
  onLimpar: () => void;
}

export function FiltroViagens({ filtros, onFiltroChange, onLimpar }: FiltroViagensProps) {
  return (
    <div className="bg-card p-4 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Search className="h-4 w-4" />
          Filtros
        </h3>
        <Button variant="ghost" size="sm" onClick={onLimpar}>
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="palavraChave">Buscar por título</Label>
          <Input
            id="palavraChave"
            placeholder="Ex: praia, montanha..."
            value={filtros.palavraChave}
            onChange={e => onFiltroChange({ palavraChave: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="destino">Destino</Label>
          <Input
            id="destino"
            placeholder="Ex: Rio de Janeiro"
            value={filtros.destino}
            onChange={e => onFiltroChange({ destino: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="precoMin">Preço mínimo</Label>
          <Input
            id="precoMin"
            type="number"
            min="0"
            placeholder="0,00"
            value={filtros.precoMin}
            onChange={e => onFiltroChange({ precoMin: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="precoMax">Preço máximo</Label>
          <Input
            id="precoMax"
            type="number"
            min="0"
            placeholder="10000,00"
            value={filtros.precoMax}
            onChange={e => onFiltroChange({ precoMax: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
