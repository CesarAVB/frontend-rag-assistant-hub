import { API_ENDPOINTS } from '@/config/api';
import type { Assistente, CreateAssistenteDTO, UpdateAssistenteDTO } from '@/types';

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

export const assistenteService = {
  // ================================
  // # listar - Lista todos os assistentes
  // ================================
  async listar(): Promise<Assistente[]> {
    const response = await fetch(API_ENDPOINTS.assistentes);
    return handleResponse<Assistente[]>(response);
  },

  // ================================
  // # obter - Obtém um assistente por ID
  // ================================
  async obter(id: number): Promise<Assistente> {
    const response = await fetch(API_ENDPOINTS.assistente(id));
    return handleResponse<Assistente>(response);
  },

  // ================================
  // # criar - Cria um novo assistente
  // ================================
  async criar(data: CreateAssistenteDTO): Promise<Assistente> {
    const response = await fetch(API_ENDPOINTS.assistentes, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Assistente>(response);
  },

  // ================================
  // # atualizar - Atualiza um assistente existente
  // ================================
  async atualizar(id: number, data: UpdateAssistenteDTO): Promise<Assistente> {
    const response = await fetch(API_ENDPOINTS.assistente(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Assistente>(response);
  },

  // ================================
  // # deletar - Deleta um assistente por ID
  // ================================
  async deletar(id: number): Promise<void> {
    const response = await fetch(API_ENDPOINTS.assistente(id), {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};
