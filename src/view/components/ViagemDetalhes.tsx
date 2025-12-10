/**
 * View Component - ViagemDetalhes
 * Exibe detalhes de uma viagem com carrossel de images
 */

import { useState } from 'react';
import { Viagem } from '@/model/entities/Viagem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { MapPin, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

interface ViagemDetalhesProps {
  viagem: Viagem | null;
  onClose: () => void;
}

export function ViagemDetalhes({ viagem, onClose }: ViagemDetalhesProps) {
  const [imagemAtual, setImagemAtual] = useState(0);

  // Se ainda não existe viagem, não renderiza nada
  if (!viagem) return null;

  // Garante que images sempre é um array — CORREÇÃO PRINCIPAL
  const images = viagem.images ?? [];

  const proximaImagem = () => {
    if (images.length === 0) return;
    setImagemAtual((prev) => (prev + 1) % images.length);
  };

  const imagemAnterior = () => {
    if (images.length === 0) return;
    setImagemAtual((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={!!viagem} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{viagem.titulo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Carrossel de images */}
          {images.length > 0 && (
            <div className="relative">
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={images[imagemAtual]}
                  alt={`${viagem.titulo} - Imagem ${imagemAtual + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Controles */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={imagemAnterior}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={proximaImagem}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Indicadores */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          index === imagemAtual ? 'bg-primary' : 'bg-muted'
                        }`}
                        onClick={() => setImagemAtual(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Informações */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">{viagem.destino}</span>
            </div>

            <div className="flex items-center gap-2 text-primary font-bold text-xl">
              <DollarSign className="h-5 w-5" />
              <span>R$ {viagem.preco.toFixed(2)}</span>
            </div>

            {viagem.descricao && (
              <div>
                <h4 className="font-semibold mb-1">Descrição</h4>
                <p className="text-muted-foreground">{viagem.descricao}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
