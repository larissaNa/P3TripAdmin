/**
 * ViewModel - useViagens
 * Hook que gerencia o estado e lógica das viagens
 */

import { useState, useEffect, useCallback } from 'react';
import { Viagem, ViagemInput } from '@/model/entities/Viagem';
import { ViagemService } from '@/model/services/ViagemService';
import { useToast } from '@/hooks/use-toast';
import { NotificationService } from '@/model/services/NotificationService';

interface Filtros {
  destino: string;
  precoMin: string;
  precoMax: string;
  palavraChave: string;
}

export function useViagens() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [viagensFiltradas, setViagensFiltradas] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viagemSelecionada, setViagemSelecionada] = useState<Viagem | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({
    destino: '',
    precoMin: '',
    precoMax: '',
    palavraChave: ''
  });
  
  const { toast } = useToast();

  // Carregar viagens
  const carregarViagens = useCallback(async () => {
    try {
      setLoading(true);
      const dados = await ViagemService.listar();
      setViagens(dados);
      setViagensFiltradas(dados);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as viagens',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar ao montar
  useEffect(() => {
    carregarViagens();
  }, [carregarViagens]);

  // Aplicar filtros
  useEffect(() => {
    const resultado = ViagemService.filtrar(viagens, {
      destino: filtros.destino || undefined,
      precoMin: filtros.precoMin ? parseFloat(filtros.precoMin) : undefined,
      precoMax: filtros.precoMax ? parseFloat(filtros.precoMax) : undefined,
      palavraChave: filtros.palavraChave || undefined
    });
    setViagensFiltradas(resultado);
  }, [viagens, filtros]);

  // Criar viagem
  const criarViagem = async (dados: ViagemInput, arquivos: File[]) => {
    try {
      await ViagemService.criar(dados, arquivos);
      
      // Enviar notificação push
      NotificationService.notificarNovaViagem(dados.titulo, dados.destino);

      toast({
        title: 'Sucesso',
        description: 'Viagem cadastrada com sucesso!'
      });
      await carregarViagens();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cadastrar a viagem',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Atualizar viagem
  const atualizarViagem = async (id: string, dados: Partial<ViagemInput>, arquivos: File[]) => {
    try {
      await ViagemService.atualizar(id, dados, arquivos);
      toast({
        title: 'Sucesso',
        description: 'Viagem atualizada com sucesso!'
      });
      await carregarViagens();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a viagem',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Excluir viagem
  const excluirViagem = async (id: string) => {
    try {
      await ViagemService.excluir(id);
      toast({
        title: 'Sucesso',
        description: 'Viagem excluída com sucesso!'
      });
      await carregarViagens();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a viagem',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Selecionar viagem para detalhes
  const selecionarViagem = (viagem: Viagem | null) => {
    setViagemSelecionada(viagem);
  };

  // Atualizar filtros
  const atualizarFiltros = (novosFiltros: Partial<Filtros>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  };

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      destino: '',
      precoMin: '',
      precoMax: '',
      palavraChave: ''
    });
  };

  return {
    viagens: viagensFiltradas,
    loading,
    viagemSelecionada,
    filtros,
    criarViagem,
    atualizarViagem,
    excluirViagem,
    selecionarViagem,
    atualizarFiltros,
    limparFiltros,
    recarregar: carregarViagens
  };
}
