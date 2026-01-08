-- Adiciona a coluna 'inclui' na tabela de viagens
-- NOTA: Verifique se o nome da sua tabela é 'viagens' ou 'viagem'
ALTER TABLE public.viagens ADD COLUMN IF NOT EXISTS inclui TEXT[] DEFAULT '{}';
