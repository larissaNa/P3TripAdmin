/**
 * Página de Autenticação
 * Login e cadastro de administradores
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plane, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from './ui/button';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (mode: 'login' | 'signup') => {
    // Validar entrada
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      toast({
        title: 'Erro de validação',
        description: result.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = mode === 'login' 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        let message = error.message;
        if (error.message.includes('Invalid login credentials')) {
          message = 'Email ou senha incorretos';
        } else if (error.message.includes('User already registered')) {
          message = 'Este email já está cadastrado';
        }
        
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive'
        });
      } else {
        if (mode === 'signup') {
          toast({
            title: 'Conta criada - Verifique seu e-mail',
            description: 'Verifique seu e-mail para ativar sua conta e faça login para continuar.'
          });
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Plane className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Painel de Turismo</CardTitle>
          <CardDescription>
            Acesse o painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('login'); }}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input
                      id="email-login"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-login">Senha</Label>
                    <Input
                      id="password-login"
                      type="password"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Entrar
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit('signup'); }}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Senha</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar conta
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}