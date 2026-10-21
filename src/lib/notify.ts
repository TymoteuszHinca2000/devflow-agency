import { toast } from 'sonner'

type NotificationOptions = {
  kind?: 'success' | 'info' | 'warning' | 'error'
  description?: string
  id?: string | number
  action?: { label: string; onClick: () => void }
}

export function notify(message: string, options: NotificationOptions = {}) {
  const { kind = 'info', action, ...details } = options
  const persistent = kind === 'warning' || kind === 'error' || Boolean(action)

  return toast[kind](message, {
    ...details,
    description: details.description,
    duration: persistent ? Infinity : 8000,
    action: action ? { label: action.label, onClick: () => action.onClick() } : undefined,
  })
}

export function dismissNotification(id: string | number) {
  toast.dismiss(id)
}
