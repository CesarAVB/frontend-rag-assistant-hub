import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  File, 
  Trash2, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useToastContext } from '@/hooks/useToast';
import { documentoService } from '@/services/documentoService';
import { assistenteService } from '@/services/assistenteService';
import { cn } from '@/lib/utils';
import type { Documento } from '@/types';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['application/pdf', 'text/plain'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentosPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { success, error, warning } = useToastContext();
  
  const assistenteId = Number(id);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  const { data: assistente } = useQuery({
    queryKey: ['assistente', id],
    queryFn: () => assistenteService.obter(assistenteId),
  });

  const { data: documentos, isLoading } = useQuery({
    queryKey: ['documentos', assistenteId],
    queryFn: () => documentoService.listar(assistenteId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentoService.upload(assistenteId, file),
    onSuccess: (_, file) => {
      queryClient.invalidateQueries({ queryKey: ['documentos', assistenteId] });
      success('Upload concluído!', `${file.name} foi enviado com sucesso.`);
      setUploadingFiles(prev => prev.filter(f => f !== file.name));
    },
    onError: (err: Error, file) => {
      error('Erro no upload', `Falha ao enviar ${file.name}: ${err.message}`);
      setUploadingFiles(prev => prev.filter(f => f !== file.name));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: number) => documentoService.deletar(assistenteId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos', assistenteId] });
      success('Documento deletado', 'O documento foi removido com sucesso.');
      setDeleteId(null);
    },
    onError: (err: Error) => {
      error('Erro ao deletar', err.message);
    },
  });

  const validateFile = useCallback((file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      warning('Tipo inválido', 'Apenas arquivos PDF, TXT e DOCX são aceitos.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      warning('Arquivo muito grande', 'O tamanho máximo é 50MB.');
      return false;
    }
    if (file.size === 0) {
      warning('Arquivo vazio', 'O arquivo não pode estar vazio.');
      return false;
    }
    return true;
  }, [warning]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      if (validateFile(file)) {
        setUploadingFiles(prev => [...prev, file.name]);
        uploadMutation.mutate(file);
      }
    });
  }, [validateFile, uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  }, [handleFiles]);

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-destructive" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <PageLoader message="Carregando documentos..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Documentos</h1>
                <p className="text-muted-foreground">
                  {assistente?.nome || 'Assistente'}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'glass-card rounded-xl p-8 mb-8 border-2 border-dashed transition-all duration-300 text-center',
              isDragging 
                ? 'border-primary bg-primary/10 glow-subtle' 
                : 'border-border hover:border-primary/50'
            )}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.txt,.docx"
              onChange={handleFileInput}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                <div className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
                  isDragging ? 'bg-primary/20' : 'bg-muted'
                )}>
                  <Upload className={cn(
                    'w-8 h-8 transition-colors',
                    isDragging ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <div>
                  <p className="text-lg font-medium mb-1">
                    {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos aqui ou clique para selecionar'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF, TXT ou DOCX • Máximo 50MB
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Uploading Files */}
          <AnimatePresence>
            {uploadingFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 space-y-2"
              >
                {uploadingFiles.map(fileName => (
                  <div 
                    key={fileName}
                    className="glass-card rounded-lg p-4 flex items-center gap-4"
                  >
                    <LoadingSpinner size="sm" />
                    <span className="flex-1 truncate">{fileName}</span>
                    <span className="text-sm text-muted-foreground">Enviando...</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Documents List */}
          {!documentos || documentos.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum documento"
              description="Faça upload de documentos PDF, TXT ou DOCX para enriquecer o conhecimento do assistente."
            />
          ) : (
            <div className="space-y-3">
              {documentos.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-lg p-4 flex items-center gap-4 hover:glow-subtle transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {getFileIcon(doc.tipoArquivo)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.nomeOriginal}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{doc.tipoArquivo}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.tamanhoBytes)}</span>
                    </div>
                  </div>

                  <StatusBadge status={doc.status} />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(doc.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Delete Modal */}
        <ConfirmModal
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
          title="Deletar Documento"
          message="Tem certeza que deseja deletar este documento? Os embeddings gerados também serão removidos."
          confirmText="Deletar"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </MainLayout>
  );
}
