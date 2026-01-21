/**
 * Provider pour gérer les toasts globalement dans l'app
 * Wrapper autour de ToastContext avec le composant Toast intégré
 */

import { ReactNode } from 'react'
import { ToastProvider as ToastContextProvider, useToast } from '../contexts/ToastContext'
import { Toast } from './Toast'

function ToastRenderer() {
  const { toast, hideToast } = useToast()

  return (
    <Toast
      visible={toast.visible}
      message={toast.message}
      type={toast.type}
      onClose={hideToast}
    />
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastContextProvider>
      {children}
      <ToastRenderer />
    </ToastContextProvider>
  )
}
