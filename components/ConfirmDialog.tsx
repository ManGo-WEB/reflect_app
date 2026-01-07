
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  type = 'danger',
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="bg-white w-full max-w-md rounded-lg elevation-16 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${type === 'danger' ? 'text-red-600' : 'text-yellow-600'}`}
            />
          </div>
          <div className="flex-1">
            <h3
              id="confirm-dialog-title"
              className="text-lg font-medium text-[rgba(0,0,0,0.87)] mb-2"
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-message"
              className="text-sm text-[rgba(0,0,0,0.6)]"
            >
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-[rgba(0,0,0,0.04)] rounded-full transition-colors ripple"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
          </button>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)] rounded-lg transition-colors ripple"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ripple ${
              type === 'danger'
                ? 'bg-[#D32F2F] hover:bg-[#C62828]'
                : 'bg-[#F57C00] hover:bg-[#E65100]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
