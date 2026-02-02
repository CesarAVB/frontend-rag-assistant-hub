import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Settings, Key, Cpu, Gauge, DollarSign, Clock, Database } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { useToastContext } from '@/hooks/useToast';
import { configuracaoService } from '@/services/configuracaoService';
import { TipoConfiguracao, ModeloLLM, ModeloEmbedding, NivelLog } from '@/types';
import type { Configuracao, ConfiguracaoFormData } from '@/types';

const configuracaoSchema = z.object({
  openrouterApiKey: z.string().optional(),
  embeddingModel: z.string().optional(),
  embeddingDimension: z.number().optional(),
  llmModelPadrao: z.string().optional(),
  maxTokensPerRequest: z.number().min(1, 'Deve ser maior que 0').optional(),
  maxFileSizeMb: z.number().min(1, 'Deve ser maior que 0').optional(),
  maxChunkSize: z.number().min(1, 'Deve ser maior que 0').optional(),
  temperature: z.number().min(0).max(2, 'Deve estar entre 0 e 2').optional(),
  topP: z.number().min(0).max(1, 'Deve estar entre 0 e 1').optional(),
  topK: z.number().min(1).optional(),
  custoMaximoConversa: z.number().min(0).optional(),
  custoMaximoUsuario: z.number().min(0).optional(),
  timeoutSegundos: z.number().min(1).optional(),
  chunkSize: z.number().min(1).optional(),
  chunkOverlap: z.number().min(0).optional(),
  vectorSearchLimit: z.number().min(1).optional(),
  vectorSearchMinSimilarity: z.number().min(0).max(1, 'Deve estar entre 0 e 1').optional(),
  logLevelRag: z.string().optional(),
  debugMode: z.boolean().optional(),
});

type ConfiguracaoFormDataValidated = z.infer<typeof configuracaoSchema>;

const modelosLLM = [
  { value: ModeloLLM.MISTRAL_7B, label: 'Mistral 7B Instruct' },
  { value: ModeloLLM.MISTRAL_8X7B, label: 'Mistral 8x7B (MoE)' },
  { value: ModeloLLM.OPENROUTER_AUTO, label: 'Auto (Balanceamento)' },
  { value: ModeloLLM.GPT_4_TURBO, label: 'GPT-4 Turbo' },
  { value: ModeloLLM.CLAUDE_3_OPUS, label: 'Claude 3 Opus' },
  { value: ModeloLLM.CLAUDE_3_SONNET, label: 'Claude 3 Sonnet' },
];

const modelosEmbedding = [
  { value: ModeloEmbedding.TEXT_EMBEDDING_3_SMALL, label: 'Text Embedding 3 Small (1536d)' },
  { value: ModeloEmbedding.TEXT_EMBEDDING_3_LARGE, label: 'Text Embedding 3 Large (3072d)' },
  { value: ModeloEmbedding.TEXT_EMBEDDING_ADA_002, label: 'Text Embedding Ada 002 (1536d)' },
];

export function ConfiguracoesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToastContext();

  const { data: configuracoes, isLoading } = useQuery({
    queryKey: ['configuracoes'],
    queryFn: () => configuracaoService.listar(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ConfiguracaoFormDataValidated>) => configuracaoService.atualizarMultiplas(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes'] });
      success('Configurações salvas com sucesso!');
    },
    onError: (err: Error) => {
      error('Erro ao salvar configurações', err.message);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConfiguracaoFormDataValidated>({
    resolver: zodResolver(configuracaoSchema),
  });

  // Carregar valores das configurações quando disponíveis
  useEffect(() => {
    if (configuracoes) {
      const values: Record<string, string | number | boolean> = {};
      configuracoes.forEach(config => {
        switch (config.tipoConfiguracao) {
          case TipoConfiguracao.OPENROUTER_API_KEY:
            values.openrouterApiKey = config.ehSensivel ? '' : config.valor;
            break;
          case TipoConfiguracao.EMBEDDING_MODEL:
            values.embeddingModel = config.valor;
            break;
          case TipoConfiguracao.EMBEDDING_DIMENSION:
            values.embeddingDimension = parseInt(config.valor);
            break;
          case TipoConfiguracao.LLM_MODEL_PADRAO:
            values.llmModelPadrao = config.valor;
            break;
          case TipoConfiguracao.MAX_TOKENS_PER_REQUEST:
            values.maxTokensPerRequest = parseInt(config.valor);
            break;
          case TipoConfiguracao.MAX_FILE_SIZE_MB:
            values.maxFileSizeMb = parseInt(config.valor);
            break;
          case TipoConfiguracao.MAX_CHUNK_SIZE:
            values.maxChunkSize = parseInt(config.valor);
            break;
          case TipoConfiguracao.TEMPERATURE:
            values.temperature = parseFloat(config.valor);
            break;
          case TipoConfiguracao.TOP_P:
            values.topP = parseFloat(config.valor);
            break;
          case TipoConfiguracao.TOP_K:
            values.topK = parseInt(config.valor);
            break;
          case TipoConfiguracao.CUSTO_MAXIMO_CONVERSA:
            values.custoMaximoConversa = parseFloat(config.valor);
            break;
          case TipoConfiguracao.CUSTO_MAXIMO_USUARIO:
            values.custoMaximoUsuario = parseFloat(config.valor);
            break;
          case TipoConfiguracao.TIMEOUT_SEGUNDOS:
            values.timeoutSegundos = parseInt(config.valor);
            break;
          case TipoConfiguracao.CHUNK_SIZE:
            values.chunkSize = parseInt(config.valor);
            break;
          case TipoConfiguracao.CHUNK_OVERLAP:
            values.chunkOverlap = parseInt(config.valor);
            break;
          case TipoConfiguracao.VECTOR_SEARCH_LIMIT:
            values.vectorSearchLimit = parseInt(config.valor);
            break;
          case TipoConfiguracao.VECTOR_SEARCH_MIN_SIMILARITY:
            values.vectorSearchMinSimilarity = parseFloat(config.valor);
            break;
          case TipoConfiguracao.LOG_LEVEL_RAG:
            values.logLevelRag = config.valor;
            break;
          case TipoConfiguracao.DEBUG_MODE:
            values.debugMode = config.valor === 'true';
            break;
        }
      });
      reset(values);
    }
  }, [configuracoes, reset]);

  const onSubmit = (data: ConfiguracaoFormDataValidated) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader message="Carregando configurações..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
                <p className="text-muted-foreground">
                  Configure APIs, modelos e parâmetros do sistema RAG
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* API Keys */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Key className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Chaves de API</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="openrouterApiKey">API Key OpenRouter</Label>
                  <Input
                    id="openrouterApiKey"
                    type="password"
                    placeholder="sk-or-v1-..."
                    {...register('openrouterApiKey')}
                  />
                  {errors.openrouterApiKey && (
                    <p className="text-sm text-destructive">{errors.openrouterApiKey.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modelos */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Cpu className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Modelos de IA</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Modelo LLM Padrão</Label>
                  <Select
                    value={watch('llmModelPadrao') || ''}
                    onValueChange={(value) => setValue('llmModelPadrao', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo LLM" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelosLLM.map((modelo) => (
                        <SelectItem key={modelo.value} value={modelo.value}>
                          {modelo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.llmModelPadrao && (
                    <p className="text-sm text-destructive">{errors.llmModelPadrao.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Modelo de Embedding</Label>
                  <Select
                    value={watch('embeddingModel') || ''}
                    onValueChange={(value) => setValue('embeddingModel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo de embedding" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelosEmbedding.map((modelo) => (
                        <SelectItem key={modelo.value} value={modelo.value}>
                          {modelo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.embeddingModel && (
                    <p className="text-sm text-destructive">{errors.embeddingModel.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="embeddingDimension">Dimensão do Embedding</Label>
                  <Input
                    id="embeddingDimension"
                    type="number"
                    placeholder="1536"
                    {...register('embeddingDimension', { valueAsNumber: true })}
                  />
                  {errors.embeddingDimension && (
                    <p className="text-sm text-destructive">{errors.embeddingDimension.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Parâmetros LLM */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Gauge className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Parâmetros do LLM</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxTokensPerRequest">Máx. Tokens por Requisição</Label>
                  <Input
                    id="maxTokensPerRequest"
                    type="number"
                    placeholder="4000"
                    {...register('maxTokensPerRequest', { valueAsNumber: true })}
                  />
                  {errors.maxTokensPerRequest && (
                    <p className="text-sm text-destructive">{errors.maxTokensPerRequest.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperatura</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder="0.7"
                    {...register('temperature', { valueAsNumber: true })}
                  />
                  {errors.temperature && (
                    <p className="text-sm text-destructive">{errors.temperature.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topP">Top P</Label>
                  <Input
                    id="topP"
                    type="number"
                    step="0.1"
                    placeholder="0.9"
                    {...register('topP', { valueAsNumber: true })}
                  />
                  {errors.topP && (
                    <p className="text-sm text-destructive">{errors.topP.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topK">Top K</Label>
                  <Input
                    id="topK"
                    type="number"
                    placeholder="40"
                    {...register('topK', { valueAsNumber: true })}
                  />
                  {errors.topK && (
                    <p className="text-sm text-destructive">{errors.topK.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeoutSegundos">Timeout (segundos)</Label>
                  <Input
                    id="timeoutSegundos"
                    type="number"
                    placeholder="30"
                    {...register('timeoutSegundos', { valueAsNumber: true })}
                  />
                  {errors.timeoutSegundos && (
                    <p className="text-sm text-destructive">{errors.timeoutSegundos.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Limites e Custos */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Limites e Custos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSizeMb">Tamanho Máx. Arquivo (MB)</Label>
                  <Input
                    id="maxFileSizeMb"
                    type="number"
                    placeholder="50"
                    {...register('maxFileSizeMb', { valueAsNumber: true })}
                  />
                  {errors.maxFileSizeMb && (
                    <p className="text-sm text-destructive">{errors.maxFileSizeMb.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxChunkSize">Tamanho Máx. Chunk</Label>
                  <Input
                    id="maxChunkSize"
                    type="number"
                    placeholder="10000"
                    {...register('maxChunkSize', { valueAsNumber: true })}
                  />
                  {errors.maxChunkSize && (
                    <p className="text-sm text-destructive">{errors.maxChunkSize.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custoMaximoConversa">Custo Máx. por Conversa ($)</Label>
                  <Input
                    id="custoMaximoConversa"
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    {...register('custoMaximoConversa', { valueAsNumber: true })}
                  />
                  {errors.custoMaximoConversa && (
                    <p className="text-sm text-destructive">{errors.custoMaximoConversa.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custoMaximoUsuario">Custo Máx. por Usuário ($)</Label>
                  <Input
                    id="custoMaximoUsuario"
                    type="number"
                    step="0.01"
                    placeholder="10.00"
                    {...register('custoMaximoUsuario', { valueAsNumber: true })}
                  />
                  {errors.custoMaximoUsuario && (
                    <p className="text-sm text-destructive">{errors.custoMaximoUsuario.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Processamento de Documentos */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Processamento de Documentos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="chunkSize">Tamanho do Chunk</Label>
                  <Input
                    id="chunkSize"
                    type="number"
                    placeholder="1000"
                    {...register('chunkSize', { valueAsNumber: true })}
                  />
                  {errors.chunkSize && (
                    <p className="text-sm text-destructive">{errors.chunkSize.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chunkOverlap">Overlap do Chunk</Label>
                  <Input
                    id="chunkOverlap"
                    type="number"
                    placeholder="200"
                    {...register('chunkOverlap', { valueAsNumber: true })}
                  />
                  {errors.chunkOverlap && (
                    <p className="text-sm text-destructive">{errors.chunkOverlap.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vectorSearchLimit">Limite Busca Vetorial</Label>
                  <Input
                    id="vectorSearchLimit"
                    type="number"
                    placeholder="10"
                    {...register('vectorSearchLimit', { valueAsNumber: true })}
                  />
                  {errors.vectorSearchLimit && (
                    <p className="text-sm text-destructive">{errors.vectorSearchLimit.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vectorSearchMinSimilarity">Similaridade Mín. Vetorial</Label>
                  <Input
                    id="vectorSearchMinSimilarity"
                    type="number"
                    step="0.01"
                    placeholder="0.7"
                    {...register('vectorSearchMinSimilarity', { valueAsNumber: true })}
                  />
                  {errors.vectorSearchMinSimilarity && (
                    <p className="text-sm text-destructive">{errors.vectorSearchMinSimilarity.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Debug e Logs */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Debug e Logs</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nível de Log RAG</Label>
                  <Select
                    value={watch('logLevelRag') || ''}
                    onValueChange={(value) => setValue('logLevelRag', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de log" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NivelLog.TRACE}>TRACE - Muito detalhado</SelectItem>
                      <SelectItem value={NivelLog.DEBUG}>DEBUG - Desenvolvimento</SelectItem>
                      <SelectItem value={NivelLog.INFO}>INFO - Operações gerais</SelectItem>
                      <SelectItem value={NivelLog.WARN}>WARN - Avisos</SelectItem>
                      <SelectItem value={NivelLog.ERROR}>ERROR - Erros</SelectItem>
                      <SelectItem value={NivelLog.OFF}>OFF - Sem logs</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.logLevelRag && (
                    <p className="text-sm text-destructive">{errors.logLevelRag.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="debugMode"
                      checked={watch('debugMode') || false}
                      onCheckedChange={(checked) => setValue('debugMode', checked === true)}
                    />
                    <Label htmlFor="debugMode">Modo Debug</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Habilita logs detalhados e informações de debug
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </MainLayout>
  );
}