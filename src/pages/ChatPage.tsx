import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  BarChart3,
  X,
  Hash,
  DollarSign,
  Layers,
  Clock,
  StopCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useToastContext } from '@/hooks/useToast';
import { conversaService } from '@/services/conversaService';
import { assistenteService } from '@/services/assistenteService';
import { cn } from '@/lib/utils';
import type { Mensagem } from '@/types';

export function ChatPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { error, success } = useToastContext();
  
  const conversaId = Number(id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [pergunta, setPergunta] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { data: conversa, isLoading: isLoadingConversa } = useQuery({
    queryKey: ['conversa', conversaId],
    queryFn: () => conversaService.obter(conversaId),
  });

  const { data: assistente } = useQuery({
    queryKey: ['assistente', conversa?.assistenteId],
    queryFn: () => assistenteService.obter(conversa!.assistenteId),
    enabled: Boolean(conversa?.assistenteId),
  });

  const { data: mensagens, isLoading: isLoadingMensagens } = useQuery({
    queryKey: ['mensagens', conversaId],
    queryFn: () => conversaService.obterMensagens(conversaId),
    refetchInterval: isSending ? 1000 : false,
  });

  const { data: estatisticas } = useQuery({
    queryKey: ['estatisticas', conversaId],
    queryFn: () => conversaService.obterEstatisticas(conversaId),
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (pergunta: string) => conversaService.enviarMensagem(conversaId, { pergunta }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensagens', conversaId] });
      queryClient.invalidateQueries({ queryKey: ['estatisticas', conversaId] });
      queryClient.invalidateQueries({ queryKey: ['conversa', conversaId] });
      setPergunta('');
      setIsSending(false);
    },
    onError: (err: Error) => {
      error('Erro ao enviar', err.message);
      setIsSending(false);
    },
  });

  const finalizarMutation = useMutation({
    mutationFn: () => conversaService.finalizar(conversaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversa', conversaId] });
      success('Conversa finalizada', 'A conversa foi encerrada.');
    },
    onError: (err: Error) => {
      error('Erro ao finalizar', err.message);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pergunta.trim() || isSending || conversa?.status === 'FINALIZADA') return;
    
    setIsSending(true);
    sendMutation.mutate(pergunta.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: ptBR });
    } catch {
      return '';
    }
  };

  if (isLoadingConversa || isLoadingMensagens) {
    return (
      <MainLayout>
        <PageLoader message="Carregando conversa..." />
      </MainLayout>
    );
  }

  if (!conversa) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Conversa não encontrada.</p>
        </div>
      </MainLayout>
    );
  }

  const isFinalized = conversa.status === 'FINALIZADA';

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="glass-card border-b border-border/50 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/conversas')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">{assistente?.nome || 'Assistente'}</h2>
                  <p className="text-sm text-muted-foreground">
                    {conversa.titulo || 'Conversa'}
                  </p>
                </div>
                <StatusBadge status={conversa.status} />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to={`/conversas/${conversaId}/estatisticas`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Estatísticas
                </Button>
              </Link>
              {!isFinalized && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => finalizarMutation.mutate()}
                  disabled={finalizarMutation.isPending}
                  className="gap-2 text-destructive"
                >
                  <StopCircle className="w-4 h-4" />
                  Finalizar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto max-w-3xl space-y-6">
            {mensagens?.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Olá! Como posso ajudar?</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Faça uma pergunta para iniciar a conversa com o assistente.
                </p>
              </div>
            ) : (
              mensagens?.map((msg, index) => (
                <MessageBubble key={msg.id} message={msg} formatTime={formatTime} index={index} />
              ))
            )}
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {isSending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="chat-bubble-assistant">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Footer Stats */}
        <div className="border-t border-border/50 bg-background/50 backdrop-blur-sm px-4 py-2">
          <div className="container mx-auto max-w-3xl flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Hash className="w-4 h-4" />
              {estatisticas?.tokensTotais?.toLocaleString() || 0} tokens
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              ${estatisticas?.custoTotal?.toFixed(4) || '0.0000'}
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              {estatisticas?.numMensagens || 0} mensagens
            </span>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="container mx-auto max-w-3xl">
            <div className="flex gap-3">
              <Textarea
                ref={textareaRef}
                value={pergunta}
                onChange={(e) => setPergunta(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isFinalized ? 'Conversa finalizada' : 'Digite sua mensagem... (Enter para enviar)'}
                disabled={isSending || isFinalized}
                className="flex-1 min-h-[50px] max-h-[150px] resize-none bg-muted/50"
                rows={1}
              />
              <Button 
                type="submit" 
                disabled={!pergunta.trim() || isSending || isFinalized}
                className="glow-subtle self-end"
              >
                {isSending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

interface MessageBubbleProps {
  message: Mensagem;
  formatTime: (date: string) => string;
  index: number;
}

function MessageBubble({ message, formatTime, index }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="space-y-4"
    >
      {/* User Message */}
      <div className="flex items-start gap-3 justify-end">
        <div className="max-w-[80%]">
          <div className="chat-bubble-user">
            <p className="whitespace-pre-wrap">{message.pergunta}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {formatTime(message.criadoEm)}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>

      {/* Assistant Message */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="max-w-[80%]">
          <div className="chat-bubble-assistant">
            <p className="whitespace-pre-wrap">{message.resposta}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>{formatTime(message.criadoEm)}</span>
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {message.tokensTotal}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {message.chunksRecuperados} chunks
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
