import { Viagem, ViagemInput } from '@/model/entities/Viagem';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { X, CalendarIcon, Plus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useViagemFormViewModel } from '@/viewmodel/components/useViagemFormViewModel';

interface ViagemFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dados: ViagemInput, arquivos: File[]) => Promise<void>;
  viagemEdicao?: Viagem | null;
}

export function ViagemForm({ open, onClose, onSubmit, viagemEdicao }: ViagemFormProps) {

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [destino, setDestino] = useState('');
  const [preco, setPreco] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [imagensExistentes, setImagensExistentes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Estado para itens inclusos
  const [inclui, setInclui] = useState<string[]>([]);
  const [novoItemInclui, setNovoItemInclui] = useState('');

  // 🔥 Estado corrigido: nunca undefined, sempre um DateRange válido
  const [periodo, setPeriodo] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const [dias, setDias] = useState('');

  // Carrega dados no modo edição
  useEffect(() => {
    if (viagemEdicao) {
      setTitulo(viagemEdicao.titulo || '');
      setDescricao(viagemEdicao.descricao || '');
      setDestino(viagemEdicao.destino || '');
      setPreco(viagemEdicao.preco?.toString() || '');
      setImagensExistentes(viagemEdicao.imagens || []);
      setInclui(viagemEdicao.inclui || []);

      // Converte string para período
      if (viagemEdicao.data_range) {
        const [inicio, fim] = viagemEdicao.data_range.split(" - ");

        setPeriodo({
          from: inicio ? converterData(inicio) : undefined,
          to: fim ? converterData(fim) : undefined,
        });
      }

      setDias(viagemEdicao.dias?.toString() || '');
    } else {
      handleClear();
    }
  }, [viagemEdicao, open]);

  // Converte string dd/MM/yyyy -> Date
  function converterData(str: string): Date {
    const [d, m, y] = str.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // Calcula os dias automaticamente
  useEffect(() => {
    if (periodo.from && periodo.to) {
      const diffMs = periodo.to.getTime() - periodo.from.getTime();
      const totalDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      setDias(String(totalDias));
    }
  }, [periodo]);

  const handleClear = () => {
    setTitulo('');
    setDescricao('');
    setDestino('');
    setPreco('');
    setArquivos([]);
    setImagensExistentes([]);
    setInclui([]);
    setNovoItemInclui('');

    // 🔥 reset correto
    setPeriodo({
      from: undefined,
      to: undefined,
    });

    setDias('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataRangeFormatado =
      periodo.from && periodo.to
        ? `${format(periodo.from, "dd/MM/yyyy")} - ${format(periodo.to, "dd/MM/yyyy")}`
        : undefined;

    try {
      await onSubmit(
        {
          titulo,
          descricao: descricao || undefined,
          destino,
          preco: preco ? parseFloat(preco) : undefined,
          imagens: imagensExistentes,
          inclui,
          data_range: dataRangeFormatado,
          dias: dias ? Number(dias) : undefined
        },
        arquivos
      );

      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    handleClear();
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
  const {
    titulo, setTitulo,
    descricao, setDescricao,
    destino, setDestino,
    preco, setPreco,
    arquivos,
    imagensExistentes,
    loading,
    periodo, setPeriodo,
    dias,
    handleSubmit,
    handleClose,
    handleFileChange,
    removerImagemExistente
  } = useViagemFormViewModel({ open, onClose, onSubmit, viagemEdicao });

  const adicionarInclui = () => {
    const item = novoItemInclui.trim();
    if (!item) return;

    setInclui(prev => (prev.includes(item) ? prev : [...prev, item]));
    setNovoItemInclui('');
  };

  const removerInclui = (index: number) => {
    setInclui(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{viagemEdicao ? 'Editar Viagem' : 'Nova Viagem'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* TÍTULO */}
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              required={!viagemEdicao}
            />
          </div>

          {/* DESTINO */}
          <div>
            <Label htmlFor="destino">Destino</Label>
            <Input
              id="destino"
              value={destino}
              onChange={e => setDestino(e.target.value)}
              required={!viagemEdicao}
            />
          </div>

          {/* PREÇO */}
          <div>
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              value={preco}
              onChange={e => setPreco(e.target.value)}
              required={!viagemEdicao}
            />
          </div>

          {/* DESCRIÇÃO */}
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={3}
            />
          </div>

          {/* INCLUI */}
          <div>
            <Label>O que está incluso</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={novoItemInclui}
                onChange={(e) => setNovoItemInclui(e.target.value)}
                placeholder="Ex: Hospedagem completa"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    adicionarInclui();
                  }
                }}
              />
              <Button type="button" onClick={adicionarInclui} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {inclui.length > 0 && (
              <ul className="mt-2 space-y-2">
                {inclui.map((item, index) => (
                  <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span>{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removerInclui(index)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* IMAGENS EXISTENTES */}
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

          {/* UPLOAD IMAGENS */}
          <div>
            <Label htmlFor="imagens">{viagemEdicao ? 'Adicionar novas imagens' : 'Imagens'}</Label>
            <Input id="imagens" type="file" accept="image/*" multiple onChange={handleFileChange} />
          </div>

          {/* PREVIEW IMAGENS NOVAS */}
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

          {/* CALENDÁRIO RANGE */}
          <div className="flex flex-col gap-2">
            <Label>Período da viagem</Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {periodo.from && periodo.to
                    ? `${format(periodo.from, "dd/MM/yyyy")} - ${format(periodo.to, "dd/MM/yyyy")}`
                    : "Selecione o período"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="p-0">
                <Calendar
                  mode="range"
                  selected={periodo}
                  onSelect={(value) => setPeriodo(value ?? { from: undefined, to: undefined })}
                  numberOfMonths={1}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* DIAS AUTOMÁTICOS */}
          <div>
            <Label htmlFor="dias">Quantidade de dias</Label>
            <Input
              id="dias"
              type="number"
              min="1"
              value={dias}
              readOnly
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
