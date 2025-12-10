/**
 * View Component - ViagemForm
 * Formulário para criar/editar viagens
 */

import { useState } from 'react';
import { Viagem, ViagemInput } from '@/model/entities/Viagem';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { X } from 'lucide-react';

interface ViagemFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dados: ViagemInput, arquivos: File[]) => Promise<void>;
  viagemEdicao?: Viagem | null;
}

export function ViagemForm({ open, onClose, onSubmit, viagemEdicao }: ViagemFormProps) {
  const [titulo, setTitulo] = useState(viagemEdicao?.titulo || '');
  const [descricao, setDescricao] = useState(viagemEdicao?.descricao || '');
  const [destino, setDestino] = useState(viagemEdicao?.destino || '');
  const [preco, setPreco] = useState(viagemEdicao?.preco?.toString() || '');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [imagensExistentes, setImagensExistentes] = useState<string[]>(viagemEdicao?.images || []);
  const [loading, setLoading] = useState(false);
  const [dataRange, setDataRange] = useState(viagemEdicao?.data_range || '');
  const [dias, setDias] = useState(viagemEdicao?.dias?.toString() || '');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(
        {
          titulo,
          descricao: descricao || undefined,
          destino,
          preco: parseFloat(preco),
          images: imagensExistentes,
          data_range: dataRange,
          dias: Number(dias)
        },
        arquivos
      );

      handleClose();
    } catch (error) {
      // Erro tratado no viewmodel
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitulo('');
    setDescricao('');
    setDestino('');
    setPreco('');
    setArquivos([]);
    setImagensExistentes([]);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArquivos(Array.from(e.target.files));
    }
  };

  const removerImagemExistente = (url: string) => {
    setImagensExistentes(prev => prev.filter(img => img !== url));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {viagemEdicao ? 'Editar Viagem' : 'Nova Viagem'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="destino">Destino</Label>
            <Input
              id="destino"
              value={destino}
              onChange={e => setDestino(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={preco}
              onChange={e => setPreco(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={3}
            />
          </div>

          {/* Imagens existentes */}
          {imagensExistentes.length > 0 && (
            <div>
              <Label>Imagens atuais</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {imagensExistentes.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removerImagemExistente(url)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="imagens">
              {viagemEdicao ? 'Adicionar novas imagens' : 'Imagens'}
            </Label>
            <Input
              id="imagens"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>

          {/* Preview das novas imagens */}
          {arquivos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {arquivos.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="h-16 w-16 object-cover rounded"
                />
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="dataRange">Período da viagem</Label>
            <Input
              id="dataRange"
              type="text"
              placeholder="Ex: 10/02/2025 - 15/02/2025"
              value={dataRange}
              onChange={e => setDataRange(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="dias">Quantidade de dias</Label>
            <Input
              id="dias"
              type="number"
              min="1"
              value={dias}
              onChange={e => setDias(e.target.value)}
              required
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
