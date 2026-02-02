import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Bot, Edit2, Trash2, Eye, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchInput } from '@/components/shared/SearchInput';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useToastContext } from '@/hooks/useToast';
import { assistenteService } from '@/services/assistenteService';
import type { Assistente } from '@/types';

export function AssistentesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToastContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: assistentes, isLoading } = useQuery({
    queryKey: ['assistentes'],
    queryFn: assistenteService.listar,
  });

  const deleteMutation = useMutation({
    mutationFn: assistenteService.deletar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistentes'] });
      success('Assistente deletado', 'O assistente foi removido com sucesso.');
      setDeleteId(null);
    },
    onError: (err: Error) => {
      error('Erro ao deletar', err.message);
    },
  });

  const filteredAssistentes = useMemo(() => {
    if (!assistentes) return [];
    
    return assistentes.filter((a) => {
      const matchesSearch = a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assistentes, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader message="Carregando assistentes..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Assistentes</h1>
            <p className="text-muted-foreground">
              Gerencie seus assistentes de IA com RAG
            </p>
          </div>
          <Button onClick={() => navigate('/assistentes/novo')} className="glow-subtle gap-2">
            <Plus className="w-4 h-4" />
            Novo Assistente
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar assistentes..."
            className="flex-1 max-w-md"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-muted/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ATIVO">Ativos</SelectItem>
              <SelectItem value="INATIVO">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assistentes Grid */}
        {filteredAssistentes.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="Nenhum assistente encontrado"
            description="Crie seu primeiro assistente para começar a usar o RAG."
            actionLabel="Criar Assistente"
            onAction={() => navigate('/assistentes/novo')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssistentes.map((assistente, index) => (
              <motion.div
                key={assistente.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-xl p-6 hover:glow-subtle transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <StatusBadge status={assistente.status} />
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-1">{assistente.nome}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {assistente.descricao || 'Sem descrição'}
                </p>

                <div className="text-xs text-muted-foreground mb-4">
                  <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded">
                    {assistente.modeloPadrao}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                  <Link to={`/assistentes/${assistente.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full gap-2">
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                  </Link>
                  <Link to={`/assistentes/${assistente.id}/documentos`}>
                    <Button variant="ghost" size="icon" title="Documentos">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to={`/conversas?assistente=${assistente.id}`}>
                    <Button variant="ghost" size="icon" title="Conversas">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to={`/assistentes/${assistente.id}/editar`}>
                    <Button variant="ghost" size="icon" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(assistente.id)}
                    className="text-destructive hover:text-destructive"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
          title="Deletar Assistente"
          message="Tem certeza que deseja deletar este assistente? Esta ação não pode ser desfeita e todos os documentos e conversas associados serão perdidos."
          confirmText="Deletar"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </MainLayout>
  );
}
