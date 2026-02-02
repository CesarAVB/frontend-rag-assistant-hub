import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Hash, 
  DollarSign, 
  Layers, 
  Clock,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { conversaService } from '@/services/conversaService';
import { assistenteService } from '@/services/assistenteService';

export function EstatisticasPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const conversaId = Number(id);

  const { data: conversa } = useQuery({
    queryKey: ['conversa', conversaId],
    queryFn: () => conversaService.obter(conversaId),
  });

  const { data: assistente } = useQuery({
    queryKey: ['assistente', conversa?.assistenteId],
    queryFn: () => assistenteService.obter(conversa!.assistenteId),
    enabled: Boolean(conversa?.assistenteId),
  });

  const { data: mensagens } = useQuery({
    queryKey: ['mensagens', conversaId],
    queryFn: () => conversaService.obterMensagens(conversaId),
  });

  const { data: estatisticas, isLoading } = useQuery({
    queryKey: ['estatisticas', conversaId],
    queryFn: () => conversaService.obterEstatisticas(conversaId),
  });

  if (isLoading || !conversa) {
    return (
      <MainLayout>
        <PageLoader message="Carregando estatísticas..." />
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

  const totalChunks = mensagens?.reduce((acc, m) => acc + m.chunksRecuperados, 0) || 0;
  const avgTokensPerMessage = estatisticas?.numMensagens 
    ? Math.round(estatisticas.tokensTotais / estatisticas.numMensagens)
    : 0;

  const stats = [
    {
      label: 'Total de Mensagens',
      value: estatisticas?.numMensagens || 0,
      icon: MessageSquare,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      label: 'Tokens Utilizados',
      value: (estatisticas?.tokensTotais || 0).toLocaleString(),
      icon: Hash,
      color: 'text-info',
      bgColor: 'bg-info/20',
    },
    {
      label: 'Custo Total',
      value: `$${(estatisticas?.custoTotal || 0).toFixed(4)}`,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/20',
    },
    {
      label: 'Chunks Recuperados',
      value: totalChunks.toLocaleString(),
      icon: Layers,
      color: 'text-warning',
      bgColor: 'bg-warning/20',
    },
    {
      label: 'Média Tokens/Mensagem',
      value: avgTokensPerMessage.toLocaleString(),
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
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
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Estatísticas</h1>
              <p className="text-muted-foreground">
                {conversa.titulo || 'Conversa'} • {assistente?.nome}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-xl p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Timeline */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Linha do Tempo
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-success" />
                <div>
                  <p className="font-medium">Conversa Iniciada</p>
                  <p className="text-sm text-muted-foreground">{formatDate(conversa.criadoEm)}</p>
                </div>
              </div>
              
              {conversa.finalizadoEm && (
                <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <div>
                    <p className="font-medium">Conversa Finalizada</p>
                    <p className="text-sm text-muted-foreground">{formatDate(conversa.finalizadoEm)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages Breakdown */}
          {mensagens && mensagens.length > 0 && (
            <div className="glass-card rounded-xl p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Detalhamento por Mensagem</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Input</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Output</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Chunks</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mensagens.map((msg, idx) => (
                      <tr key={msg.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-3 px-4">{idx + 1}</td>
                        <td className="py-3 px-4">{msg.tokensInput.toLocaleString()}</td>
                        <td className="py-3 px-4">{msg.tokensOutput.toLocaleString()}</td>
                        <td className="py-3 px-4 font-medium">{msg.tokensTotal.toLocaleString()}</td>
                        <td className="py-3 px-4">{msg.chunksRecuperados}</td>
                        <td className="py-3 px-4">${msg.custoConversa.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}
