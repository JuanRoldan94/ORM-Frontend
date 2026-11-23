import { Link } from 'react-router'
import { ArrowRight, Car, ChevronRight, Clock, UserRound } from 'lucide-react'
import { api } from '../api'
import type { Viaje } from '../api/tipos'
import { ACCION_HACIA, ESTADO_VIAJE, siguienteEstado } from '../dominio/estados'
import { formatearFechaHora, haceCuanto } from '../dominio/formato'
import { useAccion } from '../hooks/useAccion'
import { InsigniaViaje } from './Insignias'
import { Aviso } from './ui'

export function ViajeFila({
  viaje,
  onCambio,
  conAcciones = true,
}: {
  viaje: Viaje
  onCambio?: () => void
  conAcciones?: boolean
}) {
  const { ocupado, error, ejecutar } = useAccion()
  const siguiente = siguienteEstado(viaje.EstadoViaje)

  const avanzar = async () => {
    if (!siguiente) return
    const ok = await ejecutar(() => api.viajes.cambiarEstado(viaje.IdViaje, siguiente))
    if (ok) onCambio?.()
  }

  return (
    <article className={`viaje-fila viaje-fila--${ESTADO_VIAJE[viaje.EstadoViaje].tono}`}>
      <Link to={`/viajes/${viaje.IdViaje}`} className="viaje-fila__cuerpo">
        <div className="viaje-fila__meta">
          <span className="viaje-fila__numero">#{viaje.IdViaje}</span>
          <span className="viaje-fila__tiempo" title={formatearFechaHora(viaje.CreadoEl)}>
            <Clock size={12} aria-hidden="true" />
            {haceCuanto(viaje.CreadoEl)}
          </span>
        </div>

        <div className="viaje-fila__estado">
          <InsigniaViaje estado={viaje.EstadoViaje} />
        </div>

        <div className="viaje-fila__cliente">
          <span className="viaje-fila__cliente-nombre">{viaje.Cliente.ApellidoYNombre}</span>
          {viaje.Cliente.Telefono && (
            <span className="viaje-fila__cliente-tel">{viaje.Cliente.Telefono}</span>
          )}
        </div>

        <div className="viaje-fila__ruta">
          <span className="viaje-fila__origen" title={viaje.DireccionOrigen}>
            {viaje.DireccionOrigen}
          </span>
          <ArrowRight size={14} aria-hidden="true" className="viaje-fila__flecha" />
          <span className="viaje-fila__destino" title={viaje.DireccionDestino}>
            {viaje.DireccionDestino}
          </span>
        </div>

        <div className="viaje-fila__asignacion">
          {viaje.Chofer ? (
            <>
              <span className="viaje-fila__chofer" title={`${viaje.Chofer.Nombre} ${viaje.Chofer.Apellido}`}>
                <UserRound size={13} aria-hidden="true" />
                {viaje.Chofer.Nombre} {viaje.Chofer.Apellido}
              </span>
              {viaje.Vehiculo && (
                <span className="viaje-fila__vehiculo" title={viaje.Vehiculo.Patente}>
                  <Car size={13} aria-hidden="true" />
                  {viaje.Vehiculo.Patente}
                </span>
              )}
              {viaje.EstadoViaje === 'Pendiente' && (
                <span
                  className="badge badge--lila"
                  title="Viaje pendiente en espera de que el chofer complete su viaje activo"
                  style={{ fontSize: '0.7rem', padding: '1px 6px' }}
                >
                  En espera
                </span>
              )}
            </>
          ) : (
            <span className="viaje-fila__sin-chofer">Sin chofer asignado</span>
          )}
        </div>
      </Link>

      <div className="viaje-fila__acciones">
        {conAcciones && viaje.EstadoViaje === 'Pendiente' && (
          <Link
            to={`/viajes/${viaje.IdViaje}?accion=asignar`}
            className="btn btn--primario btn--chico viaje-fila__btn"
          >
            {viaje.Chofer ? 'Reasignar' : 'Asignar chofer'}
          </Link>
        )}
        {conAcciones && viaje.EstadoViaje !== 'Pendiente' && siguiente && (
          <button
            type="button"
            className="btn btn--primario btn--chico viaje-fila__btn"
            disabled={ocupado}
            onClick={avanzar}
          >
            {ACCION_HACIA[siguiente]}
          </button>
        )}
        <Link
          to={`/viajes/${viaje.IdViaje}`}
          className="btn-icono btn-icono--borde viaje-fila__btn-ver solo-escritorio"
          title="Ver detalle del viaje"
          aria-label="Ver detalle"
        >
          <ChevronRight size={16} />
        </Link>
      </div>

      {error && (
        <div className="viaje-fila__error">
          <Aviso>{error}</Aviso>
        </div>
      )}
    </article>
  )
}

