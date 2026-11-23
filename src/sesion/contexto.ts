import { createContext, useContext } from 'react'
import type { Usuario } from '../api/tipos'

export type UsuarioSesion = Pick<Usuario, 'IdUsuario' | 'Nombre' | 'Rol'>

export interface Sesion {
  usuario: UsuarioSesion | null
  ingresar: (usuario: UsuarioSesion) => void
  salir: () => void
}

export const SesionContexto = createContext<Sesion | null>(null)

export function useSesion() {
  const sesion = useContext(SesionContexto)
  if (!sesion) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return sesion
}
