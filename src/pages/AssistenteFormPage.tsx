import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Bot } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { useToastContext } from '@/hooks/useToast';
import { assistenteService } from '@/services/assistenteService';
import { configuracaoService } from '@/services/configuracaoService';
import type { CreateAssistenteDTO, UpdateAssistenteDTO } from '@/types';
import { StatusConfiguracao } from '@/types';

const assistenteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  promptSistema: z.string().min(10, 'Prompt do sistema deve ter pelo menos 10 caracteres'),
  instrucoesPersonalizadas: z.string().optional(),
  modeloPadrao: z.string().default('mistral-7b-instruct'),
  status: z.enum(['ATIVO', 'INATIVO']).default('ATIVO'),
});

type AssistenteFormData = z.infer<typeof assistenteSchema>;

// Removido do topo. Será movido para dentro do componente.

export function AssistenteFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { success, error } = useToastContext();

  const isEditing = Boolean(id);

  // Buscar modelos disponíveis
  const { data: modelos = [], isLoading: isLoadingModelos } = useQuery({
    queryKey: ['modelos'],
    queryFn: () => configuracaoService.listarModelos(),
  });

  const { data: assistente, isLoading } = useQuery({
    queryKey: ['assistente', id],
    queryFn: () => assistenteService.obter(Number(id)),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssistenteFormData>({
    resolver: zodResolver(assistenteSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      promptSistema: '',
      instrucoesPersonalizadas: '',
      modeloPadrao: 'mistral-7b-instruct',
      status: 'ATIVO',
    },
    values: assistente ? {
      nome: assistente.nome,
      descricao: assistente.descricao || '',
      promptSistema: assistente.promptSistema,
      instrucoesPersonalizadas: assistente.instrucoesPersonalizadas || '',
      modeloPadrao: assistente.modeloPadrao,
      status: assistente.status,
    } : undefined,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAssistenteDTO) => assistenteService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistentes'] });
      success('Assistente criado!', 'O novo assistente está pronto para uso.');
      navigate('/assistentes');
    },
    onError: (err: Error) => {
      error('Erro ao criar', err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAssistenteDTO) => assistenteService.atualizar(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistentes'] });
      queryClient.invalidateQueries({ queryKey: ['assistente', id] });
      success('Assistente atualizado!', 'As alterações foram salvas.');
      navigate('/assistentes');
    },
    onError: (err: Error) => {
      error('Erro ao atualizar', err.message);
    },
  });

  const onSubmit = (data: AssistenteFormData) => {
    const payload = {
      nome: data.nome,
      descricao: data.descricao || undefined,
      promptSistema: data.promptSistema,
      instrucoesPersonalizadas: data.instrucoesPersonalizadas || undefined,
      modeloPadrao: data.modeloPadrao,
    };
    
    if (isEditing) {
      updateMutation.mutate({ ...payload, status: data.status as StatusConfiguracao });
    } else {
      createMutation.mutate(payload);
    }
  };

  const modeloPadrao = watch('modeloPadrao');
  const status = watch('status');

  if ((isEditing && isLoading) || isLoadingModelos) {
    return (
      <MainLayout>
        <PageLoader message={isLoadingModelos ? "Carregando modelos..." : "Carregando assistente..."} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
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
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Editar Assistente' : 'Novo Assistente'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Atualize as configurações do assistente' : 'Configure seu novo assistente de IA'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="glass-card rounded-xl p-6 space-y-6">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Ex: Assistente de Vendas"
                  className="bg-muted/50"
                />
                {errors.nome && (
                  <p className="text-sm text-destructive">{errors.nome.message}</p>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  {...register('descricao')}
                  placeholder="Descreva brevemente o propósito deste assistente"
                  className="bg-muted/50 min-h-[80px]"
                />
              </div>

              {/* Prompt do Sistema */}
              <div className="space-y-2">
                <Label htmlFor="promptSistema">Prompt do Sistema *</Label>
                <Textarea
                  id="promptSistema"
                  {...register('promptSistema')}
                  placeholder="Você é um assistente especializado em..."
                  className="bg-muted/50 min-h-[150px] font-mono text-sm"
                />
                {errors.promptSistema && (
                  <p className="text-sm text-destructive">{errors.promptSistema.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Instruções principais que definem o comportamento do assistente.
                </p>
              </div>

              {/* Instruções Personalizadas */}
              <div className="space-y-2">
                <Label htmlFor="instrucoesPersonalizadas">Instruções Personalizadas</Label>
                <Textarea
                  id="instrucoesPersonalizadas"
                  {...register('instrucoesPersonalizadas')}
                  placeholder="Instruções adicionais opcionais..."
                  className="bg-muted/50 min-h-[100px] font-mono text-sm"
                />
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <Label>Modelo de IA</Label>
                <Select
                  value={modeloPadrao}
                  onValueChange={(value) => setValue('modeloPadrao', value)}
                >
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelos.map((modelo) => (
                      <SelectItem key={modelo.value} value={modelo.value}>
                        {modelo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              {isEditing && (
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label>Status do Assistente</Label>
                    <p className="text-sm text-muted-foreground">
                      {status === 'ATIVO' ? 'Assistente ativo e disponível' : 'Assistente inativo'}
                    </p>
                  </div>
                  <Switch
                    checked={status === 'ATIVO'}
                    onCheckedChange={(checked) => setValue('status', checked ? StatusConfiguracao.ATIVO : StatusConfiguracao.INATIVO)}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                className="glow-subtle gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting || createMutation.isPending || updateMutation.isPending
                  ? 'Salvando...'
                  : isEditing
                  ? 'Atualizar'
                  : 'Criar Assistente'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </MainLayout>
  );
}
