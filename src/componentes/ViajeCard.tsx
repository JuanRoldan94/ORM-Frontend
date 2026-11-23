import { Link } from 'react-router'
import { ArrowRight, Car, Clock, UserRound } from 'lucide-react'
import { api } from '../api'
import type { Viaje } from '../api/tipos'
import { ACCION_HACIA, ESTADO_VIAJE, siguienteEstado } from '../dominio/estados'
import { haceCuanto } from '../dominio/formato'
import { useAccion } from '../hooks/useAccion'
import { InsigniaViaje } from './Insignias'
import { Aviso } from './ui'

export function ViajeCard({
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
    <article className={`viaje-card viaje-card--${ESTADO_VIAJE[viaje.EstadoViaje].tono}`}>
      <Link to={`/viajes/${viaje.IdViaje}`} className="viaje-card__enlace">
        <div className="viaje-card__cabecera">
          <span className="viaje-card__numero">#{viaje.IdViaje}</span>
          <InsigniaViaje estado={viaje.EstadoViaje} />
          <span className="viaje-card__tiempo">
            <Clock size={14} aria-hidden="true" />
            {haceCuanto(viaje.CreadoEl)}
          </span>
        </div>
        <p className="viaje-card__cliente">
          {viaje.Cliente.ApellidoYNombre}
          <span>{viaje.Cliente.Telefono}</span>
        </p>
        <p className="ruta">
          <span className="ruta__punto ruta__punto--origen">{viaje.DireccionOrigen}</span>
          <ArrowRight size={16} aria-hidden="true" className="ruta__flecha" />
          <span className="ruta__punto">{viaje.DireccionDestino}</span>
        </p>
        {viaje.Chofer && (
          <p className="viaje-card__asignacion">
            <span>
              <UserRound size={14} aria-hidden="true" />
              {viaje.Chofer.Nombre} {viaje.Chofer.Apellido}
            </span>
            {viaje.Vehiculo && (
              <span>
                <Car size={14} aria-hidden="true" />
                {viaje.Vehiculo.Patente}
              </span>
            )}
          </p>
        )}
      </Link>

      {conAcciones && viaje.EstadoViaje === 'Pendiente' && (
        <div className="viaje-card__acciones">
          <Link to={`/viajes/${viaje.IdViaje}?accion=asignar`} className="btn btn--primario btn--chico">
            {viaje.Chofer ? 'Reasignar chofer' : 'Asignar chofer'}
          </Link>
        </div>
      )}
      {conAcciones && viaje.EstadoViaje !== 'Pendiente' && siguiente && (
        <div className="viaje-card__acciones">
          <button type="button" className="btn btn--primario btn--chico" disabled={ocupado} onClick={avanzar}>
            {ACCION_HACIA[siguiente]}
          </button>
        </div>
      )}
      {error && <Aviso>{error}</Aviso>}
    </article>
  )
}
