import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToastContext } from '@/hooks/useToast';
import { assistenteService } from '@/services/assistenteService';
import { conversaService } from '@/services/conversaService';
import { DEFAULT_USER_ID } from '@/config/api';

export function NovaConversaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assistenteIdParam = searchParams.get('assistente');
  
  const { error } = useToastContext();

  const { data: assistentes, isLoading } = useQuery({
    queryKey: ['assistentes'],
    queryFn: assistenteService.listar,
  });

  const activeAssistentes = assistentes?.filter((a) => a.status === 'ATIVO') || [];
  const defaultAssistenteId = activeAssistentes.length > 0 ? String(activeAssistentes[0].id) : '';
  const defaultTitulo = 'Nova conversa padrão';

  const [selectedAssistente, setSelectedAssistente] = useState<string>(assistenteIdParam || defaultAssistenteId);
  const [titulo, setTitulo] = useState(defaultTitulo);

  const createMutation = useMutation({
    mutationFn: conversaService.iniciar,
    onSuccess: (conversa) => {
      navigate(`/conversas/${conversa.id}`);
    },
    onError: (err: Error) => {
      error('Erro ao criar conversa', err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAssistente) {
      error('Selecione um assistente', 'Você precisa selecionar um assistente para iniciar a conversa.');
      return;
    }

    createMutation.mutate({
      assistenteId: Number(selectedAssistente),
      usuarioId: DEFAULT_USER_ID,
      titulo: titulo || undefined,
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader message="Carregando assistentes..." />
      </MainLayout>
    );
  }

  if (activeAssistentes.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <EmptyState
            icon={Bot}
            title="Nenhum assistente disponível"
            description="Você precisa criar pelo menos um assistente ativo para iniciar uma conversa."
            actionLabel="Criar Assistente"
            onAction={() => navigate('/assistentes/novo')}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Nova Conversa</h1>
              <p className="text-muted-foreground">
                Inicie uma conversa com um assistente
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card rounded-xl p-6 space-y-6">
              {/* Assistente */}
              <div className="space-y-2">
                <Label>Assistente *</Label>
                <Select value={selectedAssistente} onValueChange={setSelectedAssistente}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Selecione um assistente" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAssistentes.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-primary" />
                          {a.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Escolha o assistente que irá responder suas perguntas.
                </p>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="titulo">Título (opcional)</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Dúvidas sobre o produto X"
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Um título ajuda a identificar a conversa depois.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || !selectedAssistente}
                className="glow-subtle gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {createMutation.isPending ? 'Iniciando...' : 'Iniciar Conversa'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </MainLayout>
  );
}
