import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "@/hooks/useToast";
import { ToastContainer } from "@/components/shared/ToastContainer";

// Pages
import { HomePage } from "./pages/HomePage";
import { AssistentesPage } from "./pages/AssistentesPage";
import { AssistenteFormPage } from "./pages/AssistenteFormPage";
import { AssistenteDetalhesPage } from "./pages/AssistenteDetalhesPage";
import { DocumentosPage } from "./pages/DocumentosPage";
import { ConversasPage } from "./pages/ConversasPage";
import { NovaConversaPage } from "./pages/NovaConversaPage";
import { ChatPage } from "./pages/ChatPage";
import { EstatisticasPage } from "./pages/EstatisticasPage";
import { ConfiguracoesPage } from "./pages/ConfiguracoesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastProvider>
        <Toaster />
        <Sonner />
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />
            
            {/* Assistentes */}
            <Route path="/assistentes" element={<AssistentesPage />} />
            <Route path="/assistentes/novo" element={<AssistenteFormPage />} />
            <Route path="/assistentes/:id" element={<AssistenteDetalhesPage />} />
            <Route path="/assistentes/:id/editar" element={<AssistenteFormPage />} />
            <Route path="/assistentes/:id/documentos" element={<DocumentosPage />} />
            
            {/* Conversas */}
            <Route path="/conversas" element={<ConversasPage />} />
            <Route path="/conversas/nova" element={<NovaConversaPage />} />
            <Route path="/conversas/:id" element={<ChatPage />} />
            <Route path="/conversas/:id/estatisticas" element={<EstatisticasPage />} />
            
            {/* Configurações */}
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            
            {/* Chat shortcut */}
            <Route path="/chat" element={<Navigate to="/conversas" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
