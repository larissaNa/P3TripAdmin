/**
 * View - AdminPanel
 * Página principal do painel administrativo de turismo
 */

import { useState } from 'react';
import { useViagens } from '@/viewmodel/useViagens';
import { ViagemCard } from '@/view/components/ViagemCard';
import { ViagemForm } from '@/view/components/ViagemForm';
import { ViagemDetalhes } from '@/view/components/ViagemDetalhes';
import { FiltroViagens } from '@/view/components/FiltroViagens';
import { Button } from '../view/components/ui/button';
import { Viagem } from '@/model/entities/Viagem';
import { Plus, Plane, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../view//components/ui/alert-dialog';

export function AdminPanel() {
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

  const handleSubmitForm = async (dados, arquivos) => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Painel de Turismo</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={recarregar}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
            <Button onClick={handleNovaViagem}>
              <Plus className="h-4 w-4 mr-1" />
              Nova Viagem
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filtros */}
        <FiltroViagens
          filtros={filtros}
          onFiltroChange={atualizarFiltros}
          onLimpar={limparFiltros}
        />

        {/* Feed de viagens */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando viagens...
          </div>
        ) : viagens.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma viagem encontrada. Clique em "Nova Viagem" para cadastrar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viagens.map(viagem => (
              <ViagemCard
                key={viagem.id}
                viagem={viagem}
                onView={selecionarViagem}
                onEdit={handleEditarViagem}
                onDelete={id => setViagemExcluir(id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de formulário */}
      <ViagemForm
        open={formAberto}
        onClose={() => {
          setFormAberto(false);
          setViagemEdicao(null);
        }}
        onSubmit={handleSubmitForm}
        viagemEdicao={viagemEdicao}
      />

      {/* Modal de detalhes */}
      <ViagemDetalhes
        viagem={viagemSelecionada}
        onClose={() => selecionarViagem(null)}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!viagemExcluir} onOpenChange={() => setViagemExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
              As imagens associadas também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarExclusao}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
