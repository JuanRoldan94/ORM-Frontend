import { useState } from 'react'
import { Mail, Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../api'
import type { Usuario } from '../api/tipos'
import { InsigniaRol } from '../componentes/Insignias'
import { Modal } from '../componentes/Modal'
import { FormularioUsuario } from '../componentes/formularios/FormularioUsuario'
import { Aviso, BotonConfirmar, Cargando, Encabezado, Vacio } from '../componentes/ui'
import { puedeGestionarUsuarios } from '../dominio/estados'
import { iniciales } from '../dominio/formato'
import { useAccion } from '../hooks/useAccion'
import { useCarga } from '../hooks/useCarga'
import { useSesion } from '../sesion/contexto'

type Ventana = { tipo: 'nuevo' } | { tipo: 'editar'; usuario: Usuario } | null

// RF-1: el administrador da de alta usuarios con su rol y credenciales.
export function Usuarios() {
  const { usuario: actual } = useSesion()
  const { datos, error, cargando, recargar } = useCarga(() => api.usuarios.listar(), 'usuarios')
  const [ventana, setVentana] = useState<Ventana>(null)
  const baja = useAccion()

  if (!actual || !puedeGestionarUsuarios(actual.Rol)) {
    return <Aviso>Solo un Administrador o el Dueño pueden gestionar usuarios.</Aviso>
  }

  return (
    <>
      <Encabezado
        titulo="Usuarios"
        subtitulo="Cuentas de operadores y administradores"
        acciones={
          <button type="button" className="btn btn--primario" onClick={() => setVentana({ tipo: 'nuevo' })}>
            <Plus size={18} aria-hidden="true" />
            Nuevo usuario
          </button>
        }
      />

      {(error || baja.error) && <Aviso>{error ?? baja.error}</Aviso>}
      {cargando && !datos && <Cargando />}
      {datos?.length === 0 && <Vacio titulo="No hay usuarios" />}

      <div className="lista">
        {datos?.map((u) => (
          <article key={u.IdUsuario} className="tarjeta ficha">
            <div className="ficha__cabecera">
              <span className="avatar avatar--grande">{iniciales(u.Nombre)}</span>
              <div className="ficha__titulo">
                <h2>{u.Nombre}</h2>
                <InsigniaRol rol={u.Rol} />
              </div>
            </div>
            <ul className="ficha__datos">
              <li>
                <Mail size={16} aria-hidden="true" />
                {u.Mail}
              </li>
            </ul>
            <div className="ficha__acciones">
              <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setVentana({ tipo: 'editar', usuario: u })}>
                <Pencil size={16} aria-hidden="true" />
                Editar
              </button>
              {u.IdUsuario !== actual.IdUsuario && (
                <BotonConfirmar
                  className="btn btn--fantasma btn--peligro-texto btn--chico"
                  pregunta="¿Dar de baja?"
                  onConfirmar={() => void baja.ejecutar(() => api.usuarios.eliminar(u.IdUsuario)).then((ok) => ok && recargar())}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Baja
                </BotonConfirmar>
              )}
            </div>
          </article>
        ))}
      </div>

      <Modal
        abierto={ventana !== null}
        titulo={ventana?.tipo === 'editar' ? 'Editar usuario' : 'Nuevo usuario'}
        onCerrar={() => setVentana(null)}
      >
        <FormularioUsuario
          inicial={ventana?.tipo === 'editar' ? ventana.usuario : undefined}
          onGuardado={() => {
            setVentana(null)
            recargar()
          }}
          onCancelar={() => setVentana(null)}
        />
      </Modal>
    </>
  )
}
