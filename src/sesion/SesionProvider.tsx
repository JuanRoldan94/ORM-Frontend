import { useMemo, useState, type ReactNode } from 'react'
import { SesionContexto, type Sesion, type UsuarioSesion } from './contexto'

// PROVISORIO: hasta que el backend tenga login (RF-2) se elige con qué usuario operar
// y se guarda en el navegador. Después esto se reemplaza por el token de autenticación.
const CLAVE = 'orm.sesion'

function leerGuardada(): UsuarioSesion | null {
  try {
    const texto = localStorage.getItem(CLAVE)
    return texto ? (JSON.parse(texto) as UsuarioSesion) : null
  } catch {
    return null
  }
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(leerGuardada)

  const sesion = useMemo<Sesion>(
    () => ({
      usuario,
      ingresar: (u) => {
        const datos = { IdUsuario: u.IdUsuario, Nombre: u.Nombre, Rol: u.Rol }
        setUsuario(datos)
        try {
          localStorage.setItem(CLAVE, JSON.stringify(datos))
        } catch {
          // sin almacenamiento la sesión dura hasta recargar la página
        }
      },
      salir: () => {
        setUsuario(null)
        try {
          localStorage.removeItem(CLAVE)
        } catch {
          // nada que borrar
        }
      },
    }),
    [usuario],
  )

  return <SesionContexto.Provider value={sesion}>{children}</SesionContexto.Provider>
}
