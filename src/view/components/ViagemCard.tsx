/**
 * View Component - ViagemCard
 * Exibe um card de viagem no feed
 */

import { Viagem } from '@/model/entities/Viagem';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MapPin, DollarSign, Pencil, Trash2, Eye } from 'lucide-react';

interface ViagemCardProps {
  viagem: Viagem;
  onView: (viagem: Viagem) => void;
  onEdit: (viagem: Viagem) => void;
  onDelete: (id: string) => void;
}

export function ViagemCard({ viagem, onView, onEdit, onDelete }: ViagemCardProps) {
  const imagens = viagem.images ?? []; // garante que sempre seja array

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{viagem.titulo}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Imagem de capa */}
        {imagens.length > 0 ? (
          <div className="aspect-video w-full overflow-hidden rounded-md">
            <img
              src={imagens[0]}
              alt={viagem.titulo}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          // opcional: placeholder quando não houver imagens
          <div className="aspect-video w-full bg-gray-200 rounded-md flex items-center justify-center text-muted-foreground">
            Sem imagem
          </div>
        )}

        {/* Destino */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{viagem.destino}</span>
        </div>

        {/* Preço */}
        <div className="flex items-center gap-2 text-primary font-semibold">
          <DollarSign className="h-4 w-4" />
          <span>R$ {viagem.preco.toFixed(2)}</span>
        </div>

        {/* Descrição resumida */}
        {viagem.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {viagem.descricao}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onView(viagem)}>
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(viagem)}>
          <Pencil className="h-4 w-4 mr-1" />
          Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(viagem.id)}>
          <Trash2 className="h-4 w-4 mr-1" />
          Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
