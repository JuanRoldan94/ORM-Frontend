import { useState } from 'react'
import { Link } from 'react-router'
import { Pencil, Trash2 } from 'lucide-react'
import { api } from '../api'
import type { ExtravioConDetalle } from '../api/tipos'
import { InsigniaViaje } from '../componentes/Insignias'
import { Modal } from '../componentes/Modal'
import { FormularioExtravio } from '../componentes/formularios/FormularioExtravio'
import { Aviso, BotonConfirmar, Cargando, Encabezado, Vacio } from '../componentes/ui'
import { formatearFechaHora } from '../dominio/formato'
import { useAccion } from '../hooks/useAccion'
import { useCarga } from '../hooks/useCarga'

// Los extravíos se registran desde el detalle de cada viaje.
export function Extravios() {
  const { datos, error, cargando, recargar } = useCarga(() => api.extravios.listar(), 'extravios')
  const [editado, setEditado] = useState<ExtravioConDetalle | null>(null)
  const baja = useAccion()

  return (
    <>
      <Encabezado
        titulo="Extravíos"
        subtitulo="Objetos olvidados en los viajes. Para registrar uno, entrá al viaje."
      />

      {(error || baja.error) && <Aviso>{error ?? baja.error}</Aviso>}
      {cargando && !datos && <Cargando />}
      {datos?.length === 0 && <Vacio titulo="No hay extravíos registrados" />}

      <div className="lista">
        {datos?.map((ex) => (
          <article key={ex.IdExtravio} className="tarjeta ficha">
            <p className="ficha__descripcion">{ex.Descripcion}</p>
            <ul className="ficha__datos">
              <li>
                <Link to={`/viajes/${ex.IdViaje}`}>Viaje #{ex.IdViaje}</Link>
                <InsigniaViaje estado={ex.Viaje.EstadoViaje} />
              </li>
              <li>
                {ex.Viaje.DireccionOrigen} → {ex.Viaje.DireccionDestino}
              </li>
              <li>
                {ex.Cliente.ApellidoYNombre} · {ex.Cliente.Telefono}
              </li>
              <li className="texto-suave">Reportado el {formatearFechaHora(ex.CreadoEl)}</li>
            </ul>
            <div className="ficha__acciones">
              <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setEditado(ex)}>
                <Pencil size={16} aria-hidden="true" />
                Editar
              </button>
              <BotonConfirmar
                className="btn btn--fantasma btn--peligro-texto btn--chico"
                pregunta="¿Eliminar?"
                onConfirmar={() => void baja.ejecutar(() => api.extravios.eliminar(ex.IdExtravio)).then((ok) => ok && recargar())}
              >
                <Trash2 size={16} aria-hidden="true" />
                Eliminar
              </BotonConfirmar>
            </div>
          </article>
        ))}
      </div>

      <Modal abierto={editado !== null} titulo="Editar extravío" onCerrar={() => setEditado(null)}>
        {editado && (
          <FormularioExtravio
            inicial={editado}
            onGuardado={() => {
              setEditado(null)
              recargar()
            }}
            onCancelar={() => setEditado(null)}
          />
        )}
      </Modal>
    </>
  )
}
