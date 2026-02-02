import { API_ENDPOINTS } from '@/config/api';
import type { Configuracao, ConfiguracaoFormData } from '@/types';
import { TipoConfiguracao } from '@/types';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `Erro HTTP: ${response.status}`,
      response.status
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const configuracaoService = {
  // ================================
  // # listar - Lista todas as configurações
  // ================================
  async listar(): Promise<Configuracao[]> {
    const response = await fetch(API_ENDPOINTS.configuracoes);
    return handleResponse<Configuracao[]>(response);
  },

  // ================================
  // # obterPorId - Obtém configuração por ID
  // ================================
  async obterPorId(id: number): Promise<Configuracao> {
    const response = await fetch(`${API_ENDPOINTS.configuracoes}/${id}`);
    return handleResponse<Configuracao>(response);
  },

  // ================================
  // # obterPorTipo - Obtém configuração por tipo
  // ================================
  async obterPorTipo(tipo: TipoConfiguracao): Promise<Configuracao | null> {
    const response = await fetch(`${API_ENDPOINTS.configuracoes}/tipo/${tipo}`);
    if (response.status === 404) {
      return null;
    }
    return handleResponse<Configuracao>(response);
  },

  // ================================
  // # atualizar - Atualiza uma configuração específica
  // ================================
  async atualizar(id: number, data: Partial<Configuracao>): Promise<Configuracao> {
    const response = await fetch(`${API_ENDPOINTS.configuracoes}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Configuracao>(response);
  },

  // ================================
  // # atualizarMultiplas - Atualiza múltiplas configurações
  // Faz múltiplas chamadas PUT individuais já que o backend não tem bulk
  // ================================
  async atualizarMultiplas(configuracoes: Partial<ConfiguracaoFormData>): Promise<Configuracao[]> {
    const promises: Promise<Configuracao>[] = [];

    // Primeiro, buscar as configurações existentes para obter os IDs
    const existentes = await this.listar();

    // Mapeamento tipo -> configuração existente
    const mapaExistentes = new Map<TipoConfiguracao, Configuracao>();
    existentes.forEach(config => {
      mapaExistentes.set(config.tipoConfiguracao, config);
    });

    // Para cada configuração a ser atualizada
    for (const [key, value] of Object.entries(configuracoes)) {
      if (value !== undefined && value !== null && value !== '') {
        // Converter chave do form para TipoConfiguracao
        const tipoConfiguracao = this.mapFormKeyToTipoConfiguracao(key);
        if (tipoConfiguracao) {
          const existente = mapaExistentes.get(tipoConfiguracao);
          if (existente) {
            // Atualizar configuração existente
            promises.push(
              this.atualizar(existente.id, {
                valor: String(value),
                status: 'ATIVO' as const,
              })
            );
          } else {
            // Criar nova configuração
            promises.push(
              this.criar({
                tipoConfiguracao,
                chave: tipoConfiguracao, // A chave é o próprio tipo no backend
                valor: String(value),
                ehSensivel: key.toLowerCase().includes('key') || key.toLowerCase().includes('api'),
                status: 'ATIVO' as const,
              })
            );
          }
        }
      }
    }

    // Executar todas as atualizações em paralelo
    return Promise.all(promises);
  },

  // ================================
  // # criar - Cria uma nova configuração
  // ================================
  async criar(data: Omit<Configuracao, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Configuracao> {
    const response = await fetch(API_ENDPOINTS.configuracoes, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Configuracao>(response);
  },

  // ================================
  // # deletar - Deleta uma configuração
  // ================================
  async deletar(id: number): Promise<void> {
    const response = await fetch(`${API_ENDPOINTS.configuracoes}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `Erro ao deletar configuração: ${response.status}`,
        response.status
      );
    }
  },

  // ================================
  // # verificarStatus - Verifica status das configurações essenciais
  // ================================
  async verificarStatus(): Promise<{
    openrouterApiKeyConfigurada: boolean;
    embeddingModelConfigurado: boolean;
    temperatureConfigurada: boolean;
    maxTokensConfigurado: boolean;
    sistemaPronto: boolean;
  }> {
    const response = await fetch(`${API_ENDPOINTS.configuracoes}/status/checklist`);
    return handleResponse<{
      openrouterApiKeyConfigurada: boolean;
      embeddingModelConfigurado: boolean;
      temperatureConfigurada: boolean;
      maxTokensConfigurado: boolean;
      sistemaPronto: boolean;
    }>(response);
  },

  // ================================
  // # Helper: Mapeia chave do form para TipoConfiguracao
  // ================================
  mapFormKeyToTipoConfiguracao(key: string): TipoConfiguracao | null {
    const mapping: Record<string, TipoConfiguracao> = {
      openrouterApiKey: TipoConfiguracao.OPENROUTER_API_KEY,
      embeddingModel: TipoConfiguracao.EMBEDDING_MODEL,
      embeddingDimension: TipoConfiguracao.EMBEDDING_DIMENSION,
      llmModelPadrao: TipoConfiguracao.LLM_MODEL_PADRAO,
      maxTokensPerRequest: TipoConfiguracao.MAX_TOKENS_PER_REQUEST,
      maxFileSizeMb: TipoConfiguracao.MAX_FILE_SIZE_MB,
      maxChunkSize: TipoConfiguracao.MAX_CHUNK_SIZE,
      temperature: TipoConfiguracao.TEMPERATURE,
      topP: TipoConfiguracao.TOP_P,
      topK: TipoConfiguracao.TOP_K,
      custoMaximoConversa: TipoConfiguracao.CUSTO_MAXIMO_CONVERSA,
      custoMaximoUsuario: TipoConfiguracao.CUSTO_MAXIMO_USUARIO,
      timeoutSegundos: TipoConfiguracao.TIMEOUT_SEGUNDOS,
      chunkSize: TipoConfiguracao.CHUNK_SIZE,
      chunkOverlap: TipoConfiguracao.CHUNK_OVERLAP,
      vectorSearchLimit: TipoConfiguracao.VECTOR_SEARCH_LIMIT,
      vectorSearchMinSimilarity: TipoConfiguracao.VECTOR_SEARCH_MIN_SIMILARITY,
      logLevelRag: TipoConfiguracao.LOG_LEVEL_RAG,
      debugMode: TipoConfiguracao.DEBUG_MODE,
    };

    return mapping[key] || null;
  },
};