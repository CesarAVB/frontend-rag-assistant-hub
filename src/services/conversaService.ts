import { API_ENDPOINTS, DEFAULT_USER_ID } from '@/config/api';
import type { Conversa, Mensagem, ChatStatistics, CreateConversaDTO, SendMensagemDTO } from '@/types';

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

export const conversaService = {
  // ================================
  // # iniciar - Inicia uma nova conversa
  // ================================
  async iniciar(data: CreateConversaDTO): Promise<Conversa> {
    const response = await fetch(API_ENDPOINTS.conversas, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, usuarioId: data.usuarioId || DEFAULT_USER_ID }),
    });
    return handleResponse<Conversa>(response);
  },

  // ================================
  // # obter - Obtém uma conversa por ID
  // ================================
  async obter(id: number): Promise<Conversa> {
    const response = await fetch(API_ENDPOINTS.conversa(id));
    return handleResponse<Conversa>(response);
  },

  // ================================
  // # listarPorAssistente - Lista conversas por assistente
  // ================================
  async listarPorAssistente(assistenteId: number): Promise<Conversa[]> {
    const response = await fetch(API_ENDPOINTS.conversasByAssistente(assistenteId));
    return handleResponse<Conversa[]>(response);
  },

  // ================================
  // # listarPorUsuario - Lista conversas por usuário
  // ================================
  async listarPorUsuario(usuarioId: string = DEFAULT_USER_ID): Promise<Conversa[]> {
    const response = await fetch(API_ENDPOINTS.conversasByUsuario(usuarioId));
    return handleResponse<Conversa[]>(response);
  },

  // ================================
  // # finalizar - Finaliza uma conversa
  // ================================
  async finalizar(id: number): Promise<Conversa> {
    const response = await fetch(API_ENDPOINTS.finalizarConversa(id), {
      method: 'PUT',
    });
    return handleResponse<Conversa>(response);
  },

  // ================================
  // # obterMensagens - Obtém mensagens de uma conversa
  // ================================
  async obterMensagens(conversaId: number): Promise<Mensagem[]> {
    const response = await fetch(API_ENDPOINTS.mensagens(conversaId));
    return handleResponse<Mensagem[]>(response);
  },

  // ================================
  // # enviarMensagem - Envia uma mensagem para uma conversa
  // ================================
  async enviarMensagem(conversaId: number, data: SendMensagemDTO): Promise<Mensagem> {
    const response = await fetch(API_ENDPOINTS.mensagens(conversaId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Mensagem>(response);
  },

  // ================================
  // # obterEstatisticas - Obtém estatísticas de uma conversa
  // ================================
  async obterEstatisticas(conversaId: number): Promise<ChatStatistics> {
    const response = await fetch(API_ENDPOINTS.estatisticas(conversaId));
    return handleResponse<ChatStatistics>(response);
  },
};
