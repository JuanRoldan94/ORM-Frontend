// En desarrollo usa el proxy de Vite (/api → http://localhost:3000).
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const SIN_CONEXION =
  'No se pudo conectar con el servidor. ¿Está levantado el backend?'

export interface MaintenanceBlockPayload {
  code: 'MAINTENANCE_MODE'
  scope: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly maintenance?: MaintenanceBlockPayload

  constructor(status: number, mensaje: string, maintenance?: MaintenanceBlockPayload) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.maintenance = maintenance
  }
}

// Listener para notificar al MantenimientoProvider cuando salta un 503
type MaintenanceListener = (payload: MaintenanceBlockPayload) => void
const maintenanceListeners: Set<MaintenanceListener> = new Set()

export function onMaintenanceBlocked(listener: MaintenanceListener): () => void {
  maintenanceListeners.add(listener)
  return () => maintenanceListeners.delete(listener)
}

function notificarMantenimiento(payload: MaintenanceBlockPayload) {
  for (const listener of maintenanceListeners) {
    listener(payload)
  }
}

// NestJS devuelve { message: string | string[] } cuando hay un error.
function extraerMensaje(datos: unknown): string | null {
  if (typeof datos !== 'object' || datos === null || !('message' in datos)) {
    return null
  }
  const { message } = datos
  if (Array.isArray(message)) return message.join('\n')
  return typeof message === 'string' ? message : null
}

async function pedir<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  let respuesta: Response

  // Enviar el rol del usuario actual en x-user-role para permitir el bypass de admin
  let userRole: string | undefined
  try {
    const sesionTexto = localStorage.getItem('orm.sesion')
    if (sesionTexto) {
      const sesion = JSON.parse(sesionTexto) as { Rol?: string }
      userRole = sesion.Rol
    }
  } catch {
    // ignorar
  }

  const headers: Record<string, string> = {}
  if (cuerpo !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (userRole) {
    headers['x-user-role'] = userRole
  }

  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method: metodo,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ApiError(0, SIN_CONEXION)
  }

  const texto = await respuesta.text()
  let datos: unknown = null
  try {
    datos = texto ? JSON.parse(texto) : null
  } catch {
    datos = null
  }

  if (!respuesta.ok) {
    // Intercepción de respuesta 503 con código de mantenimiento
    if (
      respuesta.status === 503 &&
      typeof datos === 'object' &&
      datos !== null &&
      'code' in datos &&
      datos.code === 'MAINTENANCE_MODE'
    ) {
      const mPayload = datos as MaintenanceBlockPayload
      notificarMantenimiento(mPayload)
      throw new ApiError(503, mPayload.message || 'Módulo en mantenimiento', mPayload)
    }

    // Si el backend está apagado, el proxy de Vite responde 5xx sin JSON.
    const mensaje =
      extraerMensaje(datos) ??
      (respuesta.status >= 500 ? SIN_CONEXION : `Error ${respuesta.status}`)
    throw new ApiError(respuesta.status, mensaje)
  }
  return datos as T
}

export const http = {
  get: <T>(ruta: string) => pedir<T>('GET', ruta),
  post: <T>(ruta: string, cuerpo: unknown) => pedir<T>('POST', ruta, cuerpo),
  patch: <T>(ruta: string, cuerpo: unknown) => pedir<T>('PATCH', ruta, cuerpo),
  delete: <T>(ruta: string) => pedir<T>('DELETE', ruta),
}

export function mensajeDeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado'
}
