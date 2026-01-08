import { useState, useEffect } from 'react';
import { Viagem, ViagemInput } from '@/model/entities/Viagem';
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface UseViagemFormViewModelProps {
  viagemEdicao?: Viagem | null;
  onSubmit: (dados: ViagemInput, arquivos: File[]) => Promise<void>;
  onClose: () => void;
  open: boolean;
}

export function useViagemFormViewModel({ 
  viagemEdicao, 
  onSubmit, 
  onClose,
  open 
}: UseViagemFormViewModelProps) {
  
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [destino, setDestino] = useState('');
  const [preco, setPreco] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [imagensExistentes, setImagensExistentes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [inclui, setInclui] = useState<string[]>([]);
  const [novoItemInclui, setNovoItemInclui] = useState('');

  // Estado corrigido: nunca undefined, sempre um DateRange válido
  const [periodo, setPeriodo] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const [dias, setDias] = useState('');

  // Converte string dd/MM/yyyy -> Date
  function converterData(str: string): Date {
    const [d, m, y] = str.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const handleClear = () => {
    setTitulo('');
    setDescricao('');
    setDestino('');
    setPreco('');
    setArquivos([]);
    setImagensExistentes([]);
    setInclui([]);
    setNovoItemInclui('');

    // reset correto
    setPeriodo({
      from: undefined,
      to: undefined,
    });

    setDias('');
  };

  const handleClose = () => {
    handleClear();
    onClose();
  };

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

  // Calcula os dias automaticamente
  useEffect(() => {
    if (periodo.from && periodo.to) {
      const diffMs = periodo.to.getTime() - periodo.from.getTime();
      const totalDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      setDias(String(totalDias));
    }
  }, [periodo]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArquivos(Array.from(e.target.files));
    }
  };

  const removerImagemExistente = (url: string) => {
    setImagensExistentes(prev => prev.filter(img => img !== url));
  };

  const adicionarInclui = () => {
    const item = novoItemInclui.trim();
    if (!item) return;

    setInclui(prev => (prev.includes(item) ? prev : [...prev, item]));
    setNovoItemInclui('');
  };

  const removerInclui = (index: number) => {
    setInclui(prev => prev.filter((_, i) => i !== index));
  };

  return {
    titulo, setTitulo,
    descricao, setDescricao,
    destino, setDestino,
    preco, setPreco,
    arquivos,
    imagensExistentes,
    loading,
    periodo, setPeriodo,
    dias,
    inclui,
    novoItemInclui, setNovoItemInclui,
    handleSubmit,
    handleClose,
    handleFileChange,
    removerImagemExistente,
    adicionarInclui,
    removerInclui
  };
}
