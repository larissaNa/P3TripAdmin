-- Tabela de push tokens para notificações
CREATE TABLE IF NOT EXISTS public.push_tokens (
    token TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção (upsert) pública de tokens
-- Permite que qualquer dispositivo (mesmo sem login) registre seu token
CREATE POLICY "Permitir upsert público de tokens"
ON public.push_tokens
FOR INSERT
WITH CHECK (true);

-- Política para permitir atualização pública (para atualizar o updated_at no upsert)
CREATE POLICY "Permitir update público de tokens"
ON public.push_tokens
FOR UPDATE
USING (true);

-- Política para leitura apenas para usuários autenticados (Admin) ou service_role
CREATE POLICY "Permitir leitura apenas para autenticados"
ON public.push_tokens
FOR SELECT
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Trigger para atualizar updated_at automaticamente
-- Reutilizando a função existente update_viagens_updated_at pois a lógica é idêntica
CREATE TRIGGER update_push_tokens_updated_at
BEFORE UPDATE ON public.push_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_viagens_updated_at();
