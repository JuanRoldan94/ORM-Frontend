import { Navigate, useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { api } from '../api'
import type { Usuario } from '../api/tipos'
import { InsigniaRol } from '../componentes/Insignias'
import { FormularioUsuario } from '../componentes/formularios/FormularioUsuario'
import { Aviso, Cargando } from '../componentes/ui'
import { iniciales } from '../dominio/formato'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../sesion/contexto'

// PROVISORIO hasta que el backend tenga login (RF-2): se elige con qué usuario operar.
export function Ingresar() {
  const { usuario, ingresar } = useSesion()
  const navegar = useNavigate()
  const { datos: usuarios, error, cargando, recargar } = useCarga(() => api.usuarios.listar(), 'usuarios')

  if (usuario) return <Navigate to="/" replace />

  const elegir = (u: Usuario) => {
    ingresar(u)
    navegar('/', { replace: true })
  }

  return (
    <div className="ingreso">
      <div className="ingreso__tarjeta">
        <div className="ingreso__marca">
          <span className="marca__logo marca__logo--grande">ORM</span>
          <div>
            <h1>Organization Remiss Master</h1>
            <p>Despacho de viajes de la remisería</p>
          </div>
        </div>

        <Aviso tipo="info">
          Pantalla provisoria: cuando el backend tenga login (RF-2) acá va a ir el ingreso con mail y
          contraseña.
        </Aviso>

        {cargando && !usuarios && <Cargando />}
        {error && (
          <Aviso
            accion={
              <button type="button" className="btn btn--secundario btn--chico" onClick={recargar}>
                Reintentar
              </button>
            }
          >
            {error}
          </Aviso>
        )}

        {usuarios && usuarios.length > 0 && (
          <>
            <h2 className="ingreso__pregunta">¿Con qué usuario vas a operar?</h2>
            <ul className="lista-simple">
              {usuarios.map((u) => (
                <li key={u.IdUsuario}>
                  <button type="button" className="fila-boton" onClick={() => elegir(u)}>
                    <span className="avatar">{iniciales(u.Nombre)}</span>
                    <span className="fila-boton__texto">
                      <strong>{u.Nombre}</strong>
                      <span>{u.Mail}</span>
                    </span>
                    <InsigniaRol rol={u.Rol} />
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {usuarios && usuarios.length === 0 && (
          <>
            <h2 className="ingreso__pregunta">Todavía no hay usuarios: creá el primero</h2>
            <FormularioUsuario onGuardado={elegir} textoGuardar="Crear y entrar" />
          </>
        )}
      </div>
    </div>
  )
}
