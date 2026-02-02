import { API_ENDPOINTS } from '@/config/api';
import type { Documento } from '@/types';

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

export const documentoService = {
  // ================================
  // # listar - Lista documentos de um assistente
  // ================================
  async listar(assistenteId: number): Promise<Documento[]> {
    const response = await fetch(API_ENDPOINTS.documentos(assistenteId));
    return handleResponse<Documento[]>(response);
  },

  // ================================
  // # obter - Obtém um documento específico
  // ================================
  async obter(assistenteId: number, docId: number): Promise<Documento> {
    const response = await fetch(API_ENDPOINTS.documento(assistenteId, docId));
    return handleResponse<Documento>(response);
  },

  // ================================
  // # upload - Faz upload de um documento
  // ================================
  async upload(assistenteId: number, file: File): Promise<Documento> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(API_ENDPOINTS.documentos(assistenteId), {
      method: 'POST',
      body: formData,
    });
    return handleResponse<Documento>(response);
  },

  // ================================
  // # deletar - Deleta um documento
  // ================================
  async deletar(assistenteId: number, docId: number): Promise<void> {
    const response = await fetch(API_ENDPOINTS.documento(assistenteId, docId), {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};
