import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastContext } from '@/hooks/useToast';
import type { ToastType } from '@/types';

const toastStyles: Record<ToastType, { icon: React.ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    className: 'bg-success/20 border-success/50 text-success',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" />,
    className: 'bg-destructive/20 border-destructive/50 text-destructive',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    className: 'bg-warning/20 border-warning/50 text-warning',
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    className: 'bg-info/20 border-info/50 text-info',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => {
          const style = toastStyles[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm ${style.className}`}
            >
              <span className="flex-shrink-0 mt-0.5">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm opacity-90 mt-0.5">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
