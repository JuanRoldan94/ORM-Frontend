import { createContext } from 'react'
import type { ScopeMantenimientoInfo } from '../api/tipos'

export interface MantenimientoContextoTipo {
  globalMaintenance: boolean
  globalMessage: string
  scopedMaintenance: Record<string, ScopeMantenimientoInfo>
  cargando: boolean
  recargar: () => Promise<void>
  isScopeBlocked: (scope: string) => { blocked: boolean; message?: string }
}

export const MantenimientoContexto = createContext<MantenimientoContextoTipo>({
  globalMaintenance: false,
  globalMessage: '',
  scopedMaintenance: {},
  cargando: false,
  recargar: async () => {},
  isScopeBlocked: () => ({ blocked: false }),
})
