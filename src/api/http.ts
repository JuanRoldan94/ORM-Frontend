// En desarrollo usa el proxy de Vite (/api → http://localhost:3000).
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

const SIN_CONEXION =
  'No se pudo conectar con el servidor. ¿Está levantado el backend?'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, mensaje: string) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
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
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
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
