import { useEffect, useState } from 'react'

// Devuelve el valor recién cuando dejó de cambiar por `ms` milisegundos (para búsquedas).
export function useDemorado<T>(valor: T, ms = 300) {
  const [demorado, setDemorado] = useState(valor)
  useEffect(() => {
    const t = setTimeout(() => setDemorado(valor), ms)
    return () => clearTimeout(t)
  }, [valor, ms])
  return demorado
}
