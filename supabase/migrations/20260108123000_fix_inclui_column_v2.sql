-- Adiciona a coluna 'inclui' na tabela de viagens (tentativa na tabela 'viagem' singular)
-- NOTA: O código usa 'viagem', então esta deve ser a tabela correta.

ALTER TABLE public.viagem ADD COLUMN IF NOT EXISTS inclui TEXT[] DEFAULT '{}';
