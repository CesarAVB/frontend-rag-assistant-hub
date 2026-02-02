import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  Bot,
  Calendar,
  ArrowRight,
  Trash2,
  DollarSign,
  Hash
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchInput } from '@/components/shared/SearchInput';
import { useToastContext } from '@/hooks/useToast';
import { conversaService } from '@/services/conversaService';
import { assistenteService } from '@/services/assistenteService';
import { DEFAULT_USER_ID } from '@/config/api';
import type { Conversa, Assistente } from '@/types';

export function ConversasPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assistenteIdParam = searchParams.get('assistente');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAssistente, setSelectedAssistente] = useState<string>(assistenteIdParam || 'all');

  const { data: assistentes } = useQuery({
    queryKey: ['assistentes'],
    queryFn: assistenteService.listar,
  });

  const { data: conversas, isLoading } = useQuery({
    queryKey: ['conversas', DEFAULT_USER_ID],
    queryFn: () => conversaService.listarPorUsuario(DEFAULT_USER_ID),
  });

  const filteredConversas = useMemo(() => {
    if (!conversas) return [];
    
    return conversas.filter((c) => {
      const matchesSearch = c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || true;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesAssistente = selectedAssistente === 'all' || c.assistenteId === Number(selectedAssistente);
      return matchesSearch && matchesStatus && matchesAssistente;
    });
  }, [conversas, searchTerm, statusFilter, selectedAssistente]);

  const getAssistenteNome = (assistenteId: number) => {
    return assistentes?.find(a => a.id === assistenteId)?.nome || 'Assistente';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader message="Carregando conversas..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Conversas</h1>
            <p className="text-muted-foreground">
              Histórico de conversas com seus assistentes
            </p>
          </div>
          <Button onClick={() => navigate('/conversas/nova')} className="glow-subtle gap-2">
            <Plus className="w-4 h-4" />
            Nova Conversa
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por título..."
            className="flex-1 max-w-md"
          />
          <Select value={selectedAssistente} onValueChange={setSelectedAssistente}>
            <SelectTrigger className="w-[200px] bg-muted/50">
              <SelectValue placeholder="Assistente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Assistentes</SelectItem>
              {assistentes?.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-muted/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ATIVA">Ativas</SelectItem>
              <SelectItem value="FINALIZADA">Finalizadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conversations List */}
        {filteredConversas.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Nenhuma conversa encontrada"
            description="Inicie uma nova conversa com um assistente para começar."
            actionLabel="Nova Conversa"
            onAction={() => navigate('/conversas/nova')}
          />
        ) : (
          <div className="space-y-4">
            {filteredConversas.map((conversa, index) => (
              <motion.div
                key={conversa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/conversas/${conversa.id}`}>
                  <div className="glass-card rounded-xl p-6 hover:glow-subtle transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold truncate">
                              {conversa.titulo || 'Conversa sem título'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {getAssistenteNome(conversa.assistenteId)}
                            </p>
                          </div>
                          <StatusBadge status={conversa.status} />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(conversa.criadoEm)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Hash className="w-4 h-4" />
                            {conversa.tokensTotaisUsados.toLocaleString()} tokens
                          </span>
                          <span className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4" />
                            ${conversa.custoTotalConversa.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
