import { useCallback, useState } from 'react'
import { mensajeDeError } from '../api/http'

// Para botones y formularios que llaman a la API: maneja "ocupado" y el mensaje de error.
export function useAccion() {
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ejecutar = useCallback(async (accion: () => Promise<unknown>) => {
    setOcupado(true)
    setError(null)
    try {
      await accion()
      return true
    } catch (e) {
      setError(mensajeDeError(e))
      return false
    } finally {
      setOcupado(false)
    }
  }, [])

  return { ocupado, error, setError, ejecutar }
}
