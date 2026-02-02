import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit2, 
  FileText, 
  MessageSquare, 
  Bot,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { assistenteService } from '@/services/assistenteService';
import { documentoService } from '@/services/documentoService';
import { conversaService } from '@/services/conversaService';

export function AssistenteDetalhesPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const assistenteId = Number(id);

  const { data: assistente, isLoading } = useQuery({
    queryKey: ['assistente', id],
    queryFn: () => assistenteService.obter(assistenteId),
  });

  const { data: documentos } = useQuery({
    queryKey: ['documentos', assistenteId],
    queryFn: () => documentoService.listar(assistenteId),
    enabled: Boolean(assistenteId),
  });

  const { data: conversas } = useQuery({
    queryKey: ['conversas', assistenteId],
    queryFn: () => conversaService.listarPorAssistente(assistenteId),
    enabled: Boolean(assistenteId),
  });

  if (isLoading || !assistente) {
    return (
      <MainLayout>
        <PageLoader message="Carregando detalhes..." />
      </MainLayout>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const stats = [
    { 
      label: 'Documentos', 
      value: documentos?.length || 0, 
      icon: FileText,
      href: `/assistentes/${id}/documentos`
    },
    { 
      label: 'Conversas', 
      value: conversas?.length || 0, 
      icon: MessageSquare,
      href: `/conversas?assistente=${id}`
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bot className="w-7 h-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">{assistente.nome}</h1>
                  <StatusBadge status={assistente.status} />
                </div>
                <p className="text-muted-foreground">
                  {assistente.descricao || 'Sem descrição'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to={`/conversas/nova?assistente=${id}`}>
                <Button variant="outline" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Nova Conversa
                </Button>
              </Link>
              <Link to={`/assistentes/${id}/editar`}>
                <Button className="gap-2 glow-subtle">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {stats.map((stat) => (
              <Link key={stat.label} to={stat.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="glass-card rounded-xl p-6 hover:glow-subtle transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Info Cards */}
          <div className="space-y-6">
            {/* Modelo */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Configuração</h3>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Modelo:</span>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {assistente.modeloPadrao}
                </span>
              </div>
            </div>

            {/* Prompt do Sistema */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Prompt do Sistema</h3>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/30 p-4 rounded-lg">
                {assistente.promptSistema}
              </pre>
            </div>

            {/* Instruções Personalizadas */}
            {assistente.instrucoesPersonalizadas && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Instruções Personalizadas</h3>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/30 p-4 rounded-lg">
                  {assistente.instrucoesPersonalizadas}
                </pre>
              </div>
            )}

            {/* Timestamps */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Histórico</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{formatDate(assistente.criadoEm)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Atualizado em:</span>
                  <span>{formatDate(assistente.atualizadoEm)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
