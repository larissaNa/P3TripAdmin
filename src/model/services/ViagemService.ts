import { ViagemRepository } from '@/model/repositories/ViagemRepository';
import { Viagem, ViagemInput } from '@/model/entities/Viagem';
import { NotificationService } from '@/model/services/NotificationService';

export const ViagemService = {

  async listar(): Promise<Viagem[]> {
    return ViagemRepository.getAll();
  },

  async buscarPorId(id: string): Promise<Viagem | null> {
    return ViagemRepository.getById(id);
  },

  /**
   * Criar
   */
  async criar(viagem: ViagemInput, arquivos: File[]) {

    // cria viagem sem imagens
    const novaViagem = await ViagemRepository.create({
      ...viagem,
      imagens: []
    });

    let imagens: string[] = [];

    if (arquivos.length > 0) {
      imagens = await ViagemRepository.uploadImages(arquivos, novaViagem.id);
    }

    // atualiza com imagens
    const viagemFinal = await ViagemRepository.update(novaViagem.id, {
      imagens: imagens,
    });

    // 🔔 Disparar notificação para todos os usuários
    await NotificationService.notificarNovaViagem(viagemFinal.titulo, viagemFinal.destino);

    return viagemFinal;
  },

  /**
   * Atualizar
   */
  async atualizar(id: string, viagem: Partial<ViagemInput>, novosArquivos: File[]): Promise<Viagem> {

  //  Buscar a viagem atual (para recuperar as imagens já existentes)
  const viagemAtual = await ViagemRepository.getById(id);

  const imagensExistentes = viagemAtual?.imagens ?? [];

  //  Upload das novas imagens
  let novasImagens: string[] = [];

  if (novosArquivos.length > 0) {
    novasImagens = await ViagemRepository.uploadImages(novosArquivos, id);
  }

  //  Junta imagens existentes + novas
  const imagensFinais = [
    ...imagensExistentes,
    ...novasImagens
  ];

  //  Atualiza viagem
  const dadosAtualizados = {
    ...viagem,
    imagens: imagensFinais
  };

  return ViagemRepository.update(id, dadosAtualizados);
},

  /**
   * Excluir
   */
  async excluir(id: string): Promise<void> {
    const viagem = await ViagemRepository.getById(id);

    if (viagem && viagem.imagens.length > 0) {  // corrigido
      await ViagemRepository.deleteImages(viagem.imagens); // corrigido
    }

    await ViagemRepository.delete(id);
  },

  /**
   * Filtrar
   */
  filtrar(viagens: Viagem[], filtros: {
    destino?: string;
    precoMin?: number;
    precoMax?: number;
    palavraChave?: string;
  }): Viagem[] {
    return viagens.filter(viagem => {
      if (filtros.destino && !viagem.destino.toLowerCase().includes(filtros.destino.toLowerCase())) {
        return false;
      }
      if (filtros.precoMin && viagem.preco < filtros.precoMin) {
        return false;
      }
      if (filtros.precoMax && viagem.preco > filtros.precoMax) {
        return false;
      }
      if (filtros.palavraChave && !viagem.titulo.toLowerCase().includes(filtros.palavraChave.toLowerCase())) {
        return false;
      }
      return true;
    });
  },

  async enviarNotificacao(viagem: Viagem): Promise<void> {
    const endpoint = localStorage.getItem('notification_endpoint');
    
    if (!endpoint) {
      console.log('Nenhum endpoint de notificação configurado');
      return;
    }

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'nova_viagem',
          viagem: {
            id: viagem.id,
            titulo: viagem.titulo,
            destino: viagem.destino,
            preco: viagem.preco
          }
        })
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }
};
