import { useState } from 'react';
import { useViagens } from '../useViagens';
import { Viagem, ViagemInput } from '@/model/entities/Viagem';

export function useAdminPanelViewModel() {
  const {
    viagens,
    loading,
    viagemSelecionada,
    filtros,
    criarViagem,
    atualizarViagem,
    excluirViagem,
    selecionarViagem,
    atualizarFiltros,
    limparFiltros,
    recarregar
  } = useViagens();

  const [formAberto, setFormAberto] = useState(false);
  const [viagemEdicao, setViagemEdicao] = useState<Viagem | null>(null);
  const [viagemExcluir, setViagemExcluir] = useState<string | null>(null);

  const handleNovaViagem = () => {
    setViagemEdicao(null);
    setFormAberto(true);
  };

  const handleEditarViagem = (viagem: Viagem) => {
    setViagemEdicao(viagem);
    setFormAberto(true);
  };

  const handleSubmitForm = async (dados: ViagemInput, arquivos: File[]) => {
    if (viagemEdicao) {
      await atualizarViagem(viagemEdicao.id, dados, arquivos);
    } else {
      await criarViagem(dados, arquivos);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (viagemExcluir) {
      await excluirViagem(viagemExcluir);
      setViagemExcluir(null);
    }
  };

  const handleSolicitarExclusao = (id: string) => {
    setViagemExcluir(id);
  };

  const handleCloseForm = () => {
    setFormAberto(false);
    setViagemEdicao(null);
  };

  const handleCloseDetalhes = () => {
    selecionarViagem(null);
  };

  const handleCancelExclusao = () => {
    setViagemExcluir(null);
  };

  return {
    viagens,
    loading,
    viagemSelecionada,
    filtros,
    formAberto,
    viagemEdicao,
    viagemExcluir,
    handleNovaViagem,
    handleEditarViagem,
    handleSubmitForm,
    handleConfirmarExclusao,
    handleSolicitarExclusao,
    selecionarViagem,
    atualizarFiltros,
    limparFiltros,
    recarregar,
    handleCloseForm,
    handleCloseDetalhes,
    handleCancelExclusao
  };
}
