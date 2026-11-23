import { useState } from 'react'
import { Briefcase, Car, Clock, IdCard, Pencil, Phone, Plus, Trash2 } from 'lucide-react'
import { api } from '../api'
import type { Chofer, EstadoChofer } from '../api/tipos'
import { InsigniaChofer } from '../componentes/Insignias'
import { Modal } from '../componentes/Modal'
import { FormularioChofer } from '../componentes/formularios/FormularioChofer'
import { FormularioVehiculoChofer } from '../componentes/formularios/FormularioVehiculoChofer'
import { Aviso, BotonConfirmar, Cargando, Chips, Encabezado, Vacio } from '../componentes/ui'
import { ESTADO_CHOFER } from '../dominio/estados'
import { formatearHora, iniciales } from '../dominio/formato'
import { useAccion } from '../hooks/useAccion'
import { useCarga } from '../hooks/useCarga'

type Ventana = { tipo: 'nuevo' } | { tipo: 'editar' | 'vehiculo'; chofer: Chofer } | null

export function Choferes() {
  const [filtro, setFiltro] = useState<EstadoChofer | 'todos'>('todos')
  const { datos, error, cargando, recargar } = useCarga(
    () => api.choferes.listar(filtro === 'todos' ? {} : { EstadoChofer: filtro }),
    `choferes-${filtro}`,
  )
  const [ventana, setVentana] = useState<Ventana>(null)
  const baja = useAccion()
  const cambioEstado = useAccion()

  const guardado = () => {
    setVentana(null)
    recargar()
  }

  return (
    <>
      <Encabezado
        titulo="Choferes"
        subtitulo="Personal de conducción"
        acciones={
          <button type="button" className="btn btn--primario" onClick={() => setVentana({ tipo: 'nuevo' })}>
            <Plus size={18} aria-hidden="true" />
            Nuevo chofer
          </button>
        }
      />
      <Chips
        etiqueta="Filtrar por estado"
        valor={filtro}
        onCambiar={setFiltro}
        opciones={[
          { valor: 'todos', etiqueta: 'Todos' },
          ...(Object.keys(ESTADO_CHOFER) as EstadoChofer[]).map((e) => ({
            valor: e,
            etiqueta: ESTADO_CHOFER[e].etiqueta,
          })),
        ]}
      />

      {(error || baja.error || cambioEstado.error) && (
        <Aviso>{error ?? baja.error ?? cambioEstado.error}</Aviso>
      )}
      {cargando && !datos && <Cargando />}
      {datos?.length === 0 && <Vacio titulo="No hay choferes para mostrar" />}

      <div className="lista">
        {datos?.map((c) => {
          const viajesActivos = c.Viajes?.length ?? 0
          const enViaje = c.EstadoChofer === 'EnViaje' || viajesActivos > 0
          const pendientes = c.Viajes?.filter((v) => v.EstadoViaje === 'Pendiente').length ?? 0
          const enServicio = viajesActivos - pendientes

          return (
            <article key={c.IdChofer} className="tarjeta ficha">
              <div className="ficha__cabecera">
                <span className="avatar avatar--grande">{iniciales(`${c.Nombre} ${c.Apellido}`)}</span>
                <div className="ficha__titulo">
                  <h2>
                    {c.Nombre} {c.Apellido}
                  </h2>
                  {enViaje ? (
                    <InsigniaChofer estado="EnViaje" />
                  ) : (
                    <label className="select-inline-estado">
                      <span className="sr-only">Cambiar estado de {c.Nombre}</span>
                      <select
                        value={c.EstadoChofer}
                        className={`select-estado select-estado--${ESTADO_CHOFER[c.EstadoChofer].tono}`}
                        title="Cambiar estado del chofer"
                        disabled={cambioEstado.ocupado}
                        onChange={(e) => {
                          const nuevo = e.target.value as Exclude<EstadoChofer, 'EnViaje'>
                          void cambioEstado.ejecutar(async () => {
                            await api.choferes.editar(c.IdChofer, { EstadoChofer: nuevo })
                            recargar()
                          })
                        }}
                      >
                        <option value="Libre">Libre</option>
                        <option value="FueraDeServicio">Fuera de servicio</option>
                        <option value="Vacaciones">Vacaciones</option>
                      </select>
                    </label>
                  )}
                </div>
              </div>
              <ul className="ficha__datos">
                <li>
                  <IdCard size={16} aria-hidden="true" />
                  Licencia {c.NumeroLicencia}
                </li>
                <li>
                  <Phone size={16} aria-hidden="true" />
                  <a href={`tel:${c.Telefono}`}>{c.Telefono}</a>
                </li>
                <li>
                  <Clock size={16} aria-hidden="true" />
                  Turno {formatearHora(c.IngresoTurno)} a {formatearHora(c.FinalizacionTurno)}
                </li>
                <li>
                  <Car size={16} aria-hidden="true" />
                  {c.VehiculoActual ? `${c.VehiculoActual.Patente} · ${c.VehiculoActual.Marca} ${c.VehiculoActual.Modelo}` : 'Sin vehículo'}
                </li>
                <li>
                  <Briefcase size={16} aria-hidden="true" />
                  <span>
                    Cupo de viajes:{' '}
                    <strong>
                      {viajesActivos} de {c.MaxViajes ?? 1} activos
                    </strong>
                    {viajesActivos > 0 && (
                      <span className="texto-secundario" style={{ marginLeft: 6 }}>
                        ({enServicio > 0 ? `${enServicio} en curso` : ''}
                        {enServicio > 0 && pendientes > 0 ? ', ' : ''}
                        {pendientes > 0 ? `${pendientes} en espera` : ''})
                      </span>
                    )}
                  </span>
                </li>
              </ul>
              <div className="ficha__acciones">
                <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setVentana({ tipo: 'editar', chofer: c })}>
                  <Pencil size={16} aria-hidden="true" />
                  Editar
                </button>
                <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setVentana({ tipo: 'vehiculo', chofer: c })}>
                  <Car size={16} aria-hidden="true" />
                  Vehículo
                </button>
                <BotonConfirmar
                  className="btn btn--fantasma btn--peligro-texto btn--chico"
                  pregunta="¿Dar de baja?"
                  onConfirmar={() => void baja.ejecutar(() => api.choferes.eliminar(c.IdChofer)).then((ok) => ok && recargar())}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  Baja
                </BotonConfirmar>
              </div>
            </article>
          )
        })}
      </div>

      <Modal
        abierto={ventana?.tipo === 'nuevo' || ventana?.tipo === 'editar'}
        titulo={ventana?.tipo === 'editar' ? 'Editar chofer' : 'Nuevo chofer'}
        onCerrar={() => setVentana(null)}
      >
        <FormularioChofer
          inicial={ventana?.tipo === 'editar' ? ventana.chofer : undefined}
          onGuardado={guardado}
          onCancelar={() => setVentana(null)}
        />
      </Modal>
      <Modal abierto={ventana?.tipo === 'vehiculo'} titulo="Asignar vehículo" onCerrar={() => setVentana(null)}>
        {ventana?.tipo === 'vehiculo' && (
          <FormularioVehiculoChofer chofer={ventana.chofer} onGuardado={guardado} onCancelar={() => setVentana(null)} />
        )}
      </Modal>
    </>
  )
}
