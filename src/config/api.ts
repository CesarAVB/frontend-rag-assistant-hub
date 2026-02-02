// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  // Assistentes
  assistentes: `${API_BASE_URL}/assistentes`,
  assistente: (id: number) => `${API_BASE_URL}/assistentes/${id}`,
  
  // Documentos
  documentos: (assistenteId: number) => `${API_BASE_URL}/assistentes/${assistenteId}/documentos`,
  documento: (assistenteId: number, docId: number) => `${API_BASE_URL}/assistentes/${assistenteId}/documentos/${docId}`,
  
  // Conversas
  conversas: `${API_BASE_URL}/conversas`,
  conversa: (id: number) => `${API_BASE_URL}/conversas/${id}`,
  conversasByAssistente: (assistenteId: number) => `${API_BASE_URL}/conversas/assistente/${assistenteId}`,
  conversasByUsuario: (usuarioId: string) => `${API_BASE_URL}/conversas/usuario/${usuarioId}`,
  finalizarConversa: (id: number) => `${API_BASE_URL}/conversas/${id}/finalizar`,
  
  // Mensagens
  mensagens: (conversaId: number) => `${API_BASE_URL}/conversas/${conversaId}/mensagens`,
  estatisticas: (conversaId: number) => `${API_BASE_URL}/conversas/${conversaId}/mensagens/estatisticas`,
  
  // Configurações
  configuracoes: `${API_BASE_URL}/configuracoes`,
  modelos: `${API_BASE_URL}/configuracoes/modelos`,
};

// Default user ID (temporary - replace with auth)
export const DEFAULT_USER_ID = 'user-001';
