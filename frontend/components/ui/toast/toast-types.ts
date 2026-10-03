export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  duration?: number; 
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  createdAt: number;
}
