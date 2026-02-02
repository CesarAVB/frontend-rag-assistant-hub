import { cn } from '@/lib/utils';
import { CheckCircle, Clock, XCircle, AlertCircle, Power, PowerOff } from 'lucide-react';

type Status = 'ATIVO' | 'INATIVO' | 'PROCESSANDO' | 'PROCESSADO' | 'ERRO' | 'ATIVA' | 'FINALIZADA';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string; icon: React.ReactNode }> = {
  ATIVO: {
    label: 'Ativo',
    className: 'status-active',
    icon: <Power className="w-3 h-3" />,
  },
  INATIVO: {
    label: 'Inativo',
    className: 'status-inactive',
    icon: <PowerOff className="w-3 h-3" />,
  },
  PROCESSANDO: {
    label: 'Processando',
    className: 'status-processing',
    icon: <Clock className="w-3 h-3 animate-spin" />,
  },
  PROCESSADO: {
    label: 'Processado',
    className: 'status-active',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  ERRO: {
    label: 'Erro',
    className: 'status-error',
    icon: <XCircle className="w-3 h-3" />,
  },
  ATIVA: {
    label: 'Ativa',
    className: 'status-active',
    icon: <AlertCircle className="w-3 h-3" />,
  },
  FINALIZADA: {
    label: 'Finalizada',
    className: 'status-inactive',
    icon: <CheckCircle className="w-3 h-3" />,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.icon}
      {config.label}
    </span>
  );
}
