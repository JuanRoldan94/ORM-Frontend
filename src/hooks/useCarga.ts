import { useCallback, useEffect, useRef, useState } from 'react'
import { mensajeDeError } from '../api/http'

// Carga datos de la API. Se vuelve a ejecutar cuando cambia `clave` o al llamar a recargar().
// Mientras recarga conserva los datos anteriores (no parpadea la pantalla).
export function useCarga<T>(cargar: () => Promise<T>, clave: string) {
  const [datos, setDatos] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  // Qué pedido terminó por última vez; si no es el actual, está cargando.
  const pedido = `${clave}#${version}`
  const [terminado, setTerminado] = useState<string | null>(null)

  const cargarRef = useRef(cargar)
  useEffect(() => {
    cargarRef.current = cargar
  })

  useEffect(() => {
    let vigente = true
    cargarRef
      .current()
      .then((resultado) => {
        if (!vigente) return
        setDatos(resultado)
        setError(null)
      })
      .catch((e: unknown) => {
        if (vigente) setError(mensajeDeError(e))
      })
      .finally(() => {
        if (vigente) setTerminado(pedido)
      })
    return () => {
      vigente = false
    }
  }, [pedido])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  return { datos, error, cargando: terminado !== pedido, recargar }
}
