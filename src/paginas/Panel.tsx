import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Plus, RefreshCw } from 'lucide-react'
import { api } from '../api'
import type { EstadoDeViaje } from '../api/tipos'
import { ViajeFila } from '../componentes/ViajeFila'
import { Aviso, Cargando, Encabezado, Vacio } from '../componentes/ui'
import { ESTADO_VIAJE, ESTADOS_ACTIVOS } from '../dominio/estados'
import { useCarga } from '../hooks/useCarga'

// Hasta integrar Firestore (RF-6) el panel se refresca solo cada tantos segundos.
const REFRESCO_MS = 15000

// Módulo de monitoreo: viajes activos (RF-3, RF-6).
export function Panel() {
  const { datos, error, cargando, recargar } = useCarga(
    () => api.viajes.listar({ tipo: 'activos' }),
    'viajes-activos',
  )
  const [filtro, setFiltro] = useState<EstadoDeViaje | 'todos'>('todos')

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') {
        recargar()
      }
    }, REFRESCO_MS)
    return () => clearInterval(t)
  }, [recargar])

  const viajes = datos ?? []
  const delEstado = (e: EstadoDeViaje) => viajes.filter((v) => v.EstadoViaje === e)

  const encabezado = (
    <Encabezado
      titulo="Viajes activos"
      subtitulo={
        datos
          ? `${viajes.length} ${viajes.length === 1 ? 'activo' : 'activos'} · se actualiza cada ${REFRESCO_MS / 1000} s`
          : undefined
      }
      acciones={
        <>
          <button
            type="button"
            className="btn-icono btn-icono--borde"
            onClick={recargar}
            aria-label="Actualizar"
            disabled={cargando}
          >
            <RefreshCw size={18} className={cargando ? 'girando' : undefined} />
          </button>
          <Link to="/viajes/nuevo" className="btn btn--primario solo-escritorio">
            <Plus size={18} aria-hidden="true" />
            Nuevo viaje
          </Link>
        </>
      }
    />
  )

  if (cargando && !datos) {
    return (
      <>
        {encabezado}
        <Cargando />
      </>
    )
  }

  const lista = filtro === 'todos' ? viajes : delEstado(filtro)

  return (
    <>
      {encabezado}
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

      {/* Filtros por estado respetando colores, etiquetas y cantidad de viajes */}
      <div className="filtros-estados" role="group" aria-label="Filtrar por estado">
        <button
          type="button"
          className={`filtro-estado filtro-estado--todos ${filtro === 'todos' ? 'activo' : ''}`}
          aria-pressed={filtro === 'todos'}
          onClick={() => setFiltro('todos')}
        >
          <span className="filtro-estado__etiqueta">Todos</span>
          <span className="filtro-estado__cantidad">{viajes.length}</span>
        </button>

        {ESTADOS_ACTIVOS.map((estado) => {
          const { etiqueta, tono } = ESTADO_VIAJE[estado]
          const cantidad = delEstado(estado).length
          const activo = filtro === estado
          return (
            <button
              key={estado}
              type="button"
              className={`filtro-estado filtro-estado--${tono} ${activo ? 'activo' : ''}`}
              aria-pressed={activo}
              onClick={() => setFiltro(estado)}
            >
              <span className="filtro-estado__etiqueta">{etiqueta}</span>
              <span className="filtro-estado__cantidad">{cantidad}</span>
            </button>
          )
        })}
      </div>

      {lista.length === 0 ? (
        viajes.length === 0 ? (
          <Vacio titulo="No hay viajes activos">
            <Link to="/viajes/nuevo" className="btn btn--primario">
              Registrar un viaje
            </Link>
          </Vacio>
        ) : (
          <Vacio
            titulo={`No hay viajes en estado "${filtro !== 'todos' ? ESTADO_VIAJE[filtro].etiqueta : ''}"`}
          >
            <button
              type="button"
              className="btn btn--secundario"
              onClick={() => setFiltro('todos')}
            >
              Ver todos los viajes activos ({viajes.length})
            </button>
          </Vacio>
        )
      ) : (
        <div className="lista-viajes">
          <div className="lista-viajes__cabecera" aria-hidden="true">
            <div className="lista-viajes__cabecera-grid">
              <span># / Tiempo</span>
              <span>Estado</span>
              <span>Cliente</span>
              <span>Recorrido</span>
              <span>Chofer y Móvil</span>
            </div>
            <span className="lista-viajes__cabecera-accion">Acción</span>
          </div>

          <div className="lista-viajes__items">
            {lista.map((v) => (
              <ViajeFila key={v.IdViaje} viaje={v} onCambio={recargar} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
