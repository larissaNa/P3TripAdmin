export interface Viagem {
  id: string;
  titulo: string;
  descricao: string | null;
  destino: string;
  preco: number;
  salvo: boolean;
  data_range: string;
  dias: number;
  images: string[];   // igual ao banco
  created_at: string;
}

export interface ViagemInput {
  titulo: string;
  descricao?: string;
  destino: string;
  preco: number;
  salvo?: boolean;
  data_range: string;
  dias: number;
  images?: string[];
}
