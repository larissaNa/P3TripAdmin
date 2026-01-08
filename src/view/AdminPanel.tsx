/**
 * View - AdminPanel
 * Página principal do painel administrativo de turismo
 */

import { useAuth } from '@/hooks/useAuth';
import { useAdminPanelViewModel } from '@/viewmodel/components/useAdminPanelViewModel';
import { ViagemCard } from '@/view/components/ViagemCard';
import { ViagemForm } from '@/view/components/ViagemForm';
import { ViagemDetalhes } from '@/view/components/ViagemDetalhes';
import { FiltroViagens } from '@/view/components/FiltroViagens';
import { Button } from './components/ui/button';
import { Plus, Plane, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog';

export function AdminPanel() {
  const {
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
  } = useAdminPanelViewModel();

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={recarregar}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
              <Button onClick={handleNovaViagem}>
                <Plus className="h-4 w-4 mr-1" />
                Nova Viagem
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
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
                onDelete={handleSolicitarExclusao}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de formulário */}
      <ViagemForm
        open={formAberto}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        viagemEdicao={viagemEdicao}
      />

      {/* Modal de detalhes */}
      <ViagemDetalhes
        viagem={viagemSelecionada}
        onClose={handleCloseDetalhes}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!viagemExcluir} onOpenChange={handleCancelExclusao}>
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