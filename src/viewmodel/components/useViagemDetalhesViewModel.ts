import { useState } from 'react';
import { Viagem } from '@/model/entities/Viagem';

interface UseViagemDetalhesViewModelProps {
  viagem: Viagem | null;
}

export function useViagemDetalhesViewModel({ viagem }: UseViagemDetalhesViewModelProps) {
  const [imagemAtual, setImagemAtual] = useState(0);

  // Garante que images sempre é um array
  const images = viagem?.imagens ?? [];

  const proximaImagem = () => {
    if (images.length === 0) return;
    setImagemAtual((prev) => (prev + 1) % images.length);
  };

  const imagemAnterior = () => {
    if (images.length === 0) return;
    setImagemAtual((prev) => (prev - 1 + images.length) % images.length);
  };

  return {
    imagemAtual,
    setImagemAtual,
    images,
    proximaImagem,
    imagemAnterior
  };
}
