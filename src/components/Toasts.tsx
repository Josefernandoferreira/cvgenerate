import { useToast, type ToastKind } from '../lib/toast'

const LABELS: Record<ToastKind, string> = {
  ok: 'Sucesso',
  error: 'Atenção',
  info: 'Aguarde',
}

export function Toasts() {
  const { toasts, dismiss } = useToast()
  if (!toasts.length) return null

  return (
    <div className="toasts" role="region" aria-label="Notificações" aria-live="polite">
      {toasts.map((item) => (
        <article key={item.id} className={`toast toast-${item.kind}`} role="status">
          <span className="toast-mark" aria-hidden />
          <div className="toast-body">
            <strong>{LABELS[item.kind]}</strong>
            <p>{item.message}</p>
          </div>
          <button type="button" className="toast-close" onClick={() => dismiss(item.id)} aria-label="Fechar aviso">
            ×
          </button>
        </article>
      ))}
    </div>
  )
}
