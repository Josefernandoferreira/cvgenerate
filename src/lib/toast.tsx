import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { uid } from './id'

export type ToastKind = 'ok' | 'error' | 'info'

export type ToastItem = {
  id: string
  message: string
  kind: ToastKind
}

type ToastContextValue = {
  toasts: ToastItem[]
  push: (message: string, kind?: ToastKind) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function inferToastKind(message: string): ToastKind {
  if (/não|nao|invalido|inválido|envie|falhou|erro|impossível|impossivel/i.test(message)) {
    return 'error'
  }
  if (/traduzindo|gerando|lendo|processando/i.test(message)) return 'info'
  return 'ok'
}

function durationFor(kind: ToastKind): number | null {
  if (kind === 'info') return null
  if (kind === 'error') return 6800
  return 4200
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((list) => list.filter((item) => item.id !== id))
  }, [])

  const push = useCallback(
    (message: string, kind?: ToastKind) => {
      const text = message.trim()
      if (!text) return
      const item: ToastItem = {
        id: uid(),
        message: text,
        kind: kind ?? inferToastKind(text),
      }
      setToasts((list) => {
        const rest = list.filter((toast) => toast.kind !== 'info')
        return [...rest, item].slice(-4)
      })
      const wait = durationFor(item.kind)
      if (wait) {
        timers.current.set(
          item.id,
          window.setTimeout(() => dismiss(item.id), wait),
        )
      }
    },
    [dismiss],
  )

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) window.clearTimeout(timer)
      timers.current.clear()
    },
    [],
  )

  const value = useMemo(
    () => ({ toasts, push, dismiss }),
    [toasts, push, dismiss],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa de ToastProvider')
  return ctx
}
