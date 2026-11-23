import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, UserRound } from 'lucide-react'
import { api } from '../api'
import type { EstadoDeViaje, Viaje } from '../api/tipos'
import { InsigniaViaje } from '../componentes/Insignias'
import { ViajeCard } from '../componentes/ViajeCard'
import { Aviso, Cargando, Chips, Encabezado, Vacio } from '../componentes/ui'
import { ESTADO_VIAJE, ESTADOS_HISTORICOS } from '../dominio/estados'
import { formatearFechaHora } from '../dominio/formato'
import { useCarga } from '../hooks/useCarga'
import { ESCRITORIO, useMediaQuery } from '../hooks/useMediaQuery'

function coincide(v: Viaje, texto: string) {
  const t = texto.toLowerCase()
  return [
    v.Cliente.ApellidoYNombre,
    v.Cliente.Telefono,
    v.DireccionOrigen,
    v.DireccionDestino,
    v.Vehiculo?.Patente ?? '',
    String(v.IdViaje),
  ].some((campo) => campo.toLowerCase().includes(t))
}

function coincideChofer(v: Viaje, textoChofer: string) {
  const t = textoChofer.toLowerCase()
  if (!v.Chofer) return false
  const nombre = `${v.Chofer.Nombre} ${v.Chofer.Apellido}`.toLowerCase()
  const invertido = `${v.Chofer.Apellido} ${v.Chofer.Nombre}`.toLowerCase()
  return nombre.includes(t) || invertido.includes(t)
}

// RF-3: viajes históricos (finalizados y cancelados).
export function Historial() {
  const escritorio = useMediaQuery(ESCRITORIO)
  const navegar = useNavigate()
  const { datos, error, cargando, recargar } = useCarga(
    () => api.viajes.listar({ tipo: 'historicos' }),
    'viajes-historicos',
  )
  const [filtro, setFiltro] = useState<EstadoDeViaje | 'todos'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaChofer, setBusquedaChofer] = useState('')

  const viajes = (datos ?? [])
    .filter((v) => filtro === 'todos' || v.EstadoViaje === filtro)
    .filter((v) => !busqueda.trim() || coincide(v, busqueda.trim()))
    .filter((v) => !busquedaChofer.trim() || coincideChofer(v, busquedaChofer.trim()))

  return (
    <>
      <Encabezado titulo="Historial de viajes" subtitulo="Viajes finalizados y cancelados" />
      <div className="barra-filtros">
        <span className="input-con-icono barra-filtros__buscar">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente, dirección, patente…"
            aria-label="Buscar en el historial"
          />
        </span>
        <span className="input-con-icono barra-filtros__buscar">
          <UserRound size={18} aria-hidden="true" />
          <input
            type="search"
            value={busquedaChofer}
            onChange={(e) => setBusquedaChofer(e.target.value)}
            placeholder="Filtrar por chofer…"
            aria-label="Filtrar por chofer"
          />
        </span>
        <Chips
          etiqueta="Filtrar por estado"
          valor={filtro}
          onCambiar={setFiltro}
          opciones={[
            { valor: 'todos', etiqueta: 'Todos' },
            ...ESTADOS_HISTORICOS.map((e) => ({ valor: e, etiqueta: ESTADO_VIAJE[e].etiqueta })),
          ]}
        />
      </div>

      {cargando && !datos && <Cargando />}
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
      {datos && viajes.length === 0 && <Vacio titulo="No hay viajes para mostrar" />}

      {viajes.length > 0 &&
        (escritorio ? (
          <div className="tabla-contenedor tarjeta">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Cliente</th>
                  <th>Recorrido</th>
                  <th>Chofer</th>
                  <th>Vehículo</th>
                </tr>
              </thead>
              <tbody>
                {viajes.map((v) => (
                  <tr
                    key={v.IdViaje}
                    className="tabla__fila-enlace"
                    tabIndex={0}
                    onClick={() => navegar(`/viajes/${v.IdViaje}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navegar(`/viajes/${v.IdViaje}`)}
                  >
                    <td>{v.IdViaje}</td>
                    <td>{formatearFechaHora(v.CreadoEl)}</td>
                    <td>
                      <InsigniaViaje estado={v.EstadoViaje} />
                    </td>
                    <td>
                      {v.Cliente.ApellidoYNombre}
                      <span className="tabla__secundario">{v.Cliente.Telefono}</span>
                    </td>
                    <td>
                      {v.DireccionOrigen}
                      <span className="tabla__secundario">→ {v.DireccionDestino}</span>
                    </td>
                    <td>{v.Chofer ? `${v.Chofer.Nombre} ${v.Chofer.Apellido}` : '—'}</td>
                    <td>{v.Vehiculo?.Patente ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="lista">
            {viajes.map((v) => (
              <ViajeCard key={v.IdViaje} viaje={v} conAcciones={false} />
            ))}
          </div>
        ))}
    </>
  )
}
