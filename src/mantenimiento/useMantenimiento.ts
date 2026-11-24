import { useContext } from 'react'
import { MantenimientoContexto } from './MantenimientoContexto'

export function useMantenimiento() {
  return useContext(MantenimientoContexto)
}
