// Assistente Types
export interface Assistente {
  id: number;
  nome: string;
  descricao?: string;
  promptSistema: string;
  instrucoesPersonalizadas?: string;
  modeloPadrao: ModeloLLM;
  status: StatusConfiguracao;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateAssistenteDTO {
  nome: string;
  descricao?: string;
  promptSistema: string;
  instrucoesPersonalizadas?: string;
  modeloPadrao?: string;
}

export interface UpdateAssistenteDTO extends Partial<CreateAssistenteDTO> {
  status?: StatusConfiguracao;
}

// Documento Types
export interface Documento {
  id: number;
  nomeOriginal: string;
  tipoArquivo: TipoArquivo;
  tamanhoBytes: number;
  status: StatusDocumento;
  processadoEm?: string;
  erroProcessamento?: string;
  criadoEm: string;
}

// Conversa Types
export interface Conversa {
  id: number;
  assistenteId: number;
  usuarioId: string;
  titulo?: string;
  status: StatusConversa;
  tokensTotaisUsados: number;
  custoTotalConversa: number;
  criadoEm: string;
  finalizadoEm?: string;
}

export interface CreateConversaDTO {
  assistenteId: number;
  usuarioId: string;
  titulo?: string;
}

// Mensagem Types
export interface Mensagem {
  id: number;
  pergunta: string;
  resposta: string;
  tokensInput: number;
  tokensOutput: number;
  tokensTotal: number;
  custoConversa: number;
  modeloUtilizado: string;
  chunksRecuperados: number;
  criadoEm: string;
}

export interface SendMensagemDTO {
  pergunta: string;
}

export interface ChatStatistics {
  numMensagens: number;
  tokensTotais: number;
  custoTotal: number;
}

// Enums do Backend
export enum TipoArquivo {
  PDF = 'PDF',
  TXT = 'TXT',
  DOCX = 'DOCX',
}

export enum StatusDocumento {
  PROCESSANDO = 'PROCESSANDO',
  PROCESSADO = 'PROCESSADO',
  ERRO = 'ERRO',
}

export enum StatusConversa {
  ATIVA = 'ATIVA',
  FINALIZADA = 'FINALIZADA',
}

export enum StatusConfiguracao {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

export enum NivelLog {
  TRACE = 'TRACE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  OFF = 'OFF',
}

export enum ModeloLLM {
  MISTRAL_7B = 'mistral-7b-instruct',
  MISTRAL_8X7B = 'mistral-8x7b-instruct',
  OPENROUTER_AUTO = 'openrouter/auto',
  GPT_4_TURBO = 'gpt-4-turbo',
  CLAUDE_3_OPUS = 'claude-3-opus',
  CLAUDE_3_SONNET = 'claude-3-sonnet',
}

export enum ModeloEmbedding {
  TEXT_EMBEDDING_3_SMALL = 'text-embedding-3-small',
  TEXT_EMBEDDING_3_LARGE = 'text-embedding-3-large',
  TEXT_EMBEDDING_ADA_002 = 'text-embedding-ada-002',
}

export enum FaixaTemperatura {
  MUITO_DETERMINISTICA = 'MUITO_DETERMINISTICA',
  DETERMINISTICA = 'DETERMINISTICA',
  BALANCEADA = 'BALANCEADA',
  CRIATIVA = 'CRIATIVA',
  MUITO_CRIATIVA = 'MUITO_CRIATIVA',
}

// Configuração Types
export interface Configuracao {
  id: number;
  tipoConfiguracao: TipoConfiguracao;
  chave: string;
  valor: string;
  descricao?: string;
  ehSensivel: boolean;
  status: StatusConfiguracao;
  criadoEm: string;
  atualizadoEm: string;
}

export enum TipoConfiguracao {
  // API Keys
  OPENROUTER_API_KEY = 'OPENROUTER_API_KEY',

  // Modelos e Embeddings
  EMBEDDING_MODEL = 'EMBEDDING_MODEL',
  EMBEDDING_DIMENSION = 'EMBEDDING_DIMENSION',
  LLM_MODEL_PADRAO = 'LLM_MODEL_PADRAO',

  // Limites
  MAX_TOKENS_PER_REQUEST = 'MAX_TOKENS_PER_REQUEST',
  MAX_FILE_SIZE_MB = 'MAX_FILE_SIZE_MB',
  MAX_CHUNK_SIZE = 'MAX_CHUNK_SIZE',

  // Parâmetros LLM
  TEMPERATURE = 'TEMPERATURE',
  TOP_P = 'TOP_P',
  TOP_K = 'TOP_K',

  // Timeout e Performance
  TIMEOUT_SEGUNDOS = 'TIMEOUT_SEGUNDOS',
  CHUNK_SIZE = 'CHUNK_SIZE',
  CHUNK_OVERLAP = 'CHUNK_OVERLAP',

  // Vector Search
  VECTOR_SEARCH_LIMIT = 'VECTOR_SEARCH_LIMIT',
  VECTOR_SEARCH_MIN_SIMILARITY = 'VECTOR_SEARCH_MIN_SIMILARITY',

  // Budget/Custo
  CUSTO_MAXIMO_CONVERSA = 'CUSTO_MAXIMO_CONVERSA',
  CUSTO_MAXIMO_USUARIO = 'CUSTO_MAXIMO_USUARIO',

  // Logging e Debug
  LOG_LEVEL_RAG = 'LOG_LEVEL_RAG',
  DEBUG_MODE = 'DEBUG_MODE',
}

export interface ConfiguracaoFormData {
  openrouterApiKey?: string;
  embeddingModel?: string;
  embeddingDimension?: number;
  llmModelPadrao?: string;
  maxTokensPerRequest?: number;
  maxFileSizeMb?: number;
  maxChunkSize?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  custoMaximoConversa?: number;
  custoMaximoUsuario?: number;
  timeoutSegundos?: number;
  chunkSize?: number;
  chunkOverlap?: number;
  vectorSearchLimit?: number;
  vectorSearchMinSimilarity?: number;
  logLevelRag?: string;
  debugMode?: boolean;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
