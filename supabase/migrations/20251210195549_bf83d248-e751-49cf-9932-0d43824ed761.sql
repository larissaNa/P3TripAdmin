-- Tabela de viagens
CREATE TABLE public.viagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  destino TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL,
  imagens TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.viagens ENABLE ROW LEVEL SECURITY;

-- Política pública para leitura (admin panel público)
CREATE POLICY "Permitir leitura pública das viagens"
ON public.viagens
FOR SELECT
USING (true);

-- Política pública para inserção
CREATE POLICY "Permitir inserção pública de viagens"
ON public.viagens
FOR INSERT
WITH CHECK (true);

-- Política pública para atualização
CREATE POLICY "Permitir atualização pública de viagens"
ON public.viagens
FOR UPDATE
USING (true);

-- Política pública para exclusão
CREATE POLICY "Permitir exclusão pública de viagens"
ON public.viagens
FOR DELETE
USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_viagens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_viagens_updated_at
BEFORE UPDATE ON public.viagens
FOR EACH ROW
EXECUTE FUNCTION public.update_viagens_updated_at();

-- Criar bucket para imagens de viagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('viagens-images', 'viagens-images', true);

-- Políticas de storage
CREATE POLICY "Permitir upload público de imagens"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'viagens-images');

CREATE POLICY "Permitir leitura pública de imagens"
ON storage.objects
FOR SELECT
USING (bucket_id = 'viagens-images');

CREATE POLICY "Permitir exclusão pública de imagens"
ON storage.objects
FOR DELETE
USING (bucket_id = 'viagens-images');