import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { api } from '../api'
import { onMaintenanceBlocked, type MaintenanceBlockPayload } from '../api/http'
import type { ScopeMantenimientoInfo } from '../api/tipos'
import { MantenimientoContexto } from './MantenimientoContexto'

export function MantenimientoProvider({ children }: { children: ReactNode }) {
  const [globalMaintenance, setGlobalMaintenance] = useState(false)
  const [globalMessage, setGlobalMessage] = useState('Estamos realizando tareas de mantenimiento general.')
  const [scopedMaintenance, setScopedMaintenance] = useState<Record<string, ScopeMantenimientoInfo>>({})
  const [cargando, setCargando] = useState(true)

  const recargar = useCallback(async () => {
    try {
      const res = await api.mantenimiento.obtenerEstado()
      setGlobalMaintenance(res.global.isActive)
      if (res.global.message) {
        setGlobalMessage(res.global.message)
      }
      setScopedMaintenance(res.activeScopes ?? {})
    } catch {
      // Si la llamada falla, no interrumpir la navegación inicial
    } finally {
      setCargando(false)
    }
  }, [])

  // Hidratación inicial al montar la aplicación
  useEffect(() => {
    let activo = true
    api.mantenimiento
      .obtenerEstado()
      .then((res) => {
        if (!activo) return
        setGlobalMaintenance(res.global.isActive)
        if (res.global.message) {
          setGlobalMessage(res.global.message)
        }
        setScopedMaintenance(res.activeScopes ?? {})
      })
      .catch(() => {})
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  // Interceptor listener de respuestas 503
  useEffect(() => {
    const desuscribir = onMaintenanceBlocked((payload: MaintenanceBlockPayload) => {
      if (payload.scope === 'GLOBAL') {
        setGlobalMaintenance(true)
        if (payload.message) setGlobalMessage(payload.message)
      } else {
        setScopedMaintenance((prev) => ({
          ...prev,
          [payload.scope]: {
            isActive: true,
            message: payload.message,
          },
        }))
      }
    })
    return desuscribir
  }, [])

  const isScopeBlocked = useCallback(
    (scope: string) => {
      if (globalMaintenance) {
        return { blocked: true, message: globalMessage }
      }
      const s = scopedMaintenance[scope]
      if (s && s.isActive) {
        return { blocked: true, message: s.message }
      }
      return { blocked: false }
    },
    [globalMaintenance, globalMessage, scopedMaintenance],
  )

  return (
    <MantenimientoContexto.Provider
      value={{
        globalMaintenance,
        globalMessage,
        scopedMaintenance,
        cargando,
        recargar,
        isScopeBlocked,
      }}
    >
      {children}
    </MantenimientoContexto.Provider>
  )
}
