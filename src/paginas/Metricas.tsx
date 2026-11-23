import { useMemo, useState } from 'react'
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'
import { api } from '../api'
import type { EstadoDeViaje } from '../api/tipos'
import { Aviso, Cargando, Encabezado, Vacio } from '../componentes/ui'
import { ESTADO_VIAJE, ESTADOS_ACTIVOS, ESTADOS_HISTORICOS } from '../dominio/estados'
import { useCarga } from '../hooks/useCarga'

type PresetFecha = '7d' | '14d' | '30d' | 'mes' | 'todos' | 'personalizado'

function aStringFecha(d: Date): string {
  const anio = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function calcularRangoPreset(preset: PresetFecha): { desde: string; hasta: string } {
  const hoy = new Date()
  const hastaStr = aStringFecha(hoy)

  if (preset === '7d') {
    const d = new Date(hoy)
    d.setDate(d.getDate() - 6)
    return { desde: aStringFecha(d), hasta: hastaStr }
  }
  if (preset === '14d') {
    const d = new Date(hoy)
    d.setDate(d.getDate() - 13)
    return { desde: aStringFecha(d), hasta: hastaStr }
  }
  if (preset === '30d') {
    const d = new Date(hoy)
    d.setDate(d.getDate() - 29)
    return { desde: aStringFecha(d), hasta: hastaStr }
  }
  if (preset === 'mes') {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    return { desde: aStringFecha(d), hasta: hastaStr }
  }
  return { desde: '', hasta: '' }
}

const NOMBRES_DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const COLOR_ESTADO: Record<EstadoDeViaje, string> = {
  ViajeFinalizado: '#2e7d32',
  CanceladoPorElCliente: '#9e4e38',
  CanceladoPorElChofer: '#c05621',
  EnCurso: '#61ae65',
  ChoferEnCamino: '#94d1a3',
  Asignado: '#362c75',
  Pendiente: '#8970bb',
}

export function Metricas() {
  const { datos: viajes, cargando, error, recargar } = useCarga(
    () => api.viajes.listar(),
    'metricas-viajes',
  )

  const [preset, setPreset] = useState<PresetFecha>('7d')
  const [fechaDesde, setFechaDesde] = useState(() => calcularRangoPreset('7d').desde)
  const [fechaHasta, setFechaHasta] = useState(() => calcularRangoPreset('7d').hasta)
  const [filtroTipoEstado, setFiltroTipoEstado] = useState<'todos' | 'historicos' | 'activos'>('todos')
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null)

  const cambiarPreset = (nuevoPreset: PresetFecha) => {
    setPreset(nuevoPreset)
    if (nuevoPreset !== 'personalizado') {
      const rango = calcularRangoPreset(nuevoPreset)
      setFechaDesde(rango.desde)
      setFechaHasta(rango.hasta)
    }
  }

  const viajesFiltrados = useMemo(() => {
    if (!viajes) return []
    return viajes.filter((v) => {
      const d = aStringFecha(new Date(v.CreadoEl))
      if (fechaDesde && d < fechaDesde) return false
      if (fechaHasta && d > fechaHasta) return false
      return true
    })
  }, [viajes, fechaDesde, fechaHasta])

  const metricas = useMemo(() => {
    const total = viajesFiltrados.length
    const finalizados = viajesFiltrados.filter((v) => v.EstadoViaje === 'ViajeFinalizado').length
    const canceladosCliente = viajesFiltrados.filter((v) => v.EstadoViaje === 'CanceladoPorElCliente').length
    const canceladosChofer = viajesFiltrados.filter((v) => v.EstadoViaje === 'CanceladoPorElChofer').length
    const canceladosTotal = canceladosCliente + canceladosChofer
    const activos = viajesFiltrados.filter((v) => ESTADOS_ACTIVOS.includes(v.EstadoViaje)).length

    const pctFinalizados = total > 0 ? Math.round((finalizados / total) * 100) : 0
    const pctCancelados = total > 0 ? Math.round((canceladosTotal / total) * 100) : 0

    return {
      total,
      finalizados,
      pctFinalizados,
      canceladosTotal,
      canceladosCliente,
      canceladosChofer,
      pctCancelados,
      activos,
    }
  }, [viajesFiltrados])

  const diasGrafico = useMemo(() => {
    if (!viajesFiltrados.length && !fechaDesde && !fechaHasta) return []

    let inicio: Date
    let fin: Date

    if (fechaDesde && fechaHasta) {
      inicio = new Date(fechaDesde + 'T00:00:00')
      fin = new Date(fechaHasta + 'T00:00:00')
    } else {
      const fechas = viajesFiltrados.map((v) => new Date(v.CreadoEl).getTime())
      inicio = new Date(Math.min(...fechas))
      fin = new Date(Math.max(...fechas))
      inicio.setHours(0, 0, 0, 0)
      fin.setHours(0, 0, 0, 0)
    }

    const mapaDias: Record<
      string,
      {
        fecha: string
        etiquetaCorta: string
        etiquetaCompleta: string
        total: number
        finalizados: number
        cancelados: number
        activos: number
      }
    > = {}

    const actual = new Date(inicio)
    let iteraciones = 0
    while (actual <= fin && iteraciones < 60) {
      const fStr = aStringFecha(actual)
      const diaSem = NOMBRES_DIAS[actual.getDay()]
      const diaNum = String(actual.getDate()).padStart(2, '0')
      const mesNum = String(actual.getMonth() + 1).padStart(2, '0')

      mapaDias[fStr] = {
        fecha: fStr,
        etiquetaCorta: `${diaSem} ${diaNum}`,
        etiquetaCompleta: `${diaSem} ${diaNum}/${mesNum}`,
        total: 0,
        finalizados: 0,
        cancelados: 0,
        activos: 0,
      }
      actual.setDate(actual.getDate() + 1)
      iteraciones++
    }

    for (const v of viajesFiltrados) {
      const fStr = aStringFecha(new Date(v.CreadoEl))
      if (mapaDias[fStr]) {
        mapaDias[fStr].total++
        if (v.EstadoViaje === 'ViajeFinalizado') mapaDias[fStr].finalizados++
        else if (
          v.EstadoViaje === 'CanceladoPorElCliente' ||
          v.EstadoViaje === 'CanceladoPorElChofer'
        ) {
          mapaDias[fStr].cancelados++
        } else {
          mapaDias[fStr].activos++
        }
      }
    }

    return Object.values(mapaDias)
  }, [viajesFiltrados, fechaDesde, fechaHasta])

  const maxViajesDia = useMemo(() => {
    return Math.max(...diasGrafico.map((d) => d.total), 1)
  }, [diasGrafico])

  const estadosGrafico = useMemo(() => {
    let listaEstados: EstadoDeViaje[] = [
      'ViajeFinalizado',
      'CanceladoPorElCliente',
      'CanceladoPorElChofer',
      'EnCurso',
      'ChoferEnCamino',
      'Asignado',
      'Pendiente',
    ]

    if (filtroTipoEstado === 'historicos') {
      listaEstados = ESTADOS_HISTORICOS
    } else if (filtroTipoEstado === 'activos') {
      listaEstados = ESTADOS_ACTIVOS
    }

    const conteos = listaEstados.map((estado) => {
      const cantidad = viajesFiltrados.filter((v) => v.EstadoViaje === estado).length
      const porcentaje =
        metricas.total > 0 ? ((cantidad / metricas.total) * 100).toFixed(1) : '0.0'
      return {
        estado,
        etiqueta: ESTADO_VIAJE[estado].etiqueta,
        color: COLOR_ESTADO[estado],
        cantidad,
        porcentaje,
      }
    })

    const maxCantidad = Math.max(...conteos.map((c) => c.cantidad), 1)
    return { conteos, maxCantidad }
  }, [viajesFiltrados, filtroTipoEstado, metricas.total])

  const rankingChoferes = useMemo(() => {
    const mapa: Record<
      string,
      { nombre: string; total: number; finalizados: number; cancelados: number }
    > = {}

    for (const v of viajesFiltrados) {
      if (v.Chofer) {
        const id = String(v.Chofer.IdChofer)
        if (!mapa[id]) {
          mapa[id] = {
            nombre: `${v.Chofer.Nombre} ${v.Chofer.Apellido}`,
            total: 0,
            finalizados: 0,
            cancelados: 0,
          }
        }
        mapa[id].total++
        if (v.EstadoViaje === 'ViajeFinalizado') mapa[id].finalizados++
        if (
          v.EstadoViaje === 'CanceladoPorElCliente' ||
          v.EstadoViaje === 'CanceladoPorElChofer'
        ) {
          mapa[id].cancelados++
        }
      }
    }

    return Object.values(mapa)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [viajesFiltrados])

  return (
    <div className="metricas-pagina">
      <Encabezado
        titulo="Métricas y Estadísticas"
        subtitulo="Análisis de viajes, volumen diario y distribución por estado"
      />

      <div className="tarjeta metricas-filtros">
        <div className="metricas-filtros__cabecera">
          <span className="metricas-filtros__titulo">
            <Calendar size={18} aria-hidden="true" />
            Rango de fechas:
          </span>
          <div className="chips" role="group" aria-label="Presets de período">
            {[
              { id: '7d', label: 'Últimos 7 días' },
              { id: '14d', label: '14 días' },
              { id: '30d', label: '30 días' },
              { id: 'mes', label: 'Este mes' },
              { id: 'todos', label: 'Todo' },
              { id: 'personalizado', label: 'Personalizado' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`chip ${preset === p.id ? 'chip--activo' : ''}`}
                onClick={() => cambiarPreset(p.id as PresetFecha)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="metricas-filtros__fechas">
          <label className="campo-fecha">
            <span>Desde:</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setPreset('personalizado')
                setFechaDesde(e.target.value)
              }}
            />
          </label>
          <label className="campo-fecha">
            <span>Hasta:</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setPreset('personalizado')
                setFechaHasta(e.target.value)
              }}
            />
          </label>
          {(fechaDesde || fechaHasta) && (
            <button
              type="button"
              className="btn btn--fantasma btn--chico"
              onClick={() => cambiarPreset('todos')}
            >
              Ver todo
            </button>
          )}
        </div>
      </div>

      {cargando && !viajes && <Cargando />}
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

      {viajes && (
        <>
          <section className="metricas-kpis">
            <article className="tarjeta kpi-tarjeta">
              <div className="kpi-tarjeta__icono kpi-tarjeta__icono--indigo">
                <BarChart3 size={24} aria-hidden="true" />
              </div>
              <div className="kpi-tarjeta__info">
                <span className="kpi-tarjeta__etiqueta">Total de viajes</span>
                <strong className="kpi-tarjeta__valor">{metricas.total}</strong>
                <span className="kpi-tarjeta__subtexto">En el período seleccionado</span>
              </div>
            </article>

            <article className="tarjeta kpi-tarjeta">
              <div className="kpi-tarjeta__icono kpi-tarjeta__icono--verde">
                <CheckCircle2 size={24} aria-hidden="true" />
              </div>
              <div className="kpi-tarjeta__info">
                <span className="kpi-tarjeta__etiqueta">Viajes completados</span>
                <strong className="kpi-tarjeta__valor">{metricas.finalizados}</strong>
                <span className="kpi-tarjeta__subtexto">
                  <strong>{metricas.pctFinalizados}%</strong> de efectividad
                </span>
              </div>
            </article>

            <article className="tarjeta kpi-tarjeta">
              <div className="kpi-tarjeta__icono kpi-tarjeta__icono--oxido">
                <XCircle size={24} aria-hidden="true" />
              </div>
              <div className="kpi-tarjeta__info">
                <span className="kpi-tarjeta__etiqueta">Cancelados (total)</span>
                <strong className="kpi-tarjeta__valor">{metricas.canceladosTotal}</strong>
                <span className="kpi-tarjeta__subtexto">
                  {metricas.canceladosCliente} por cliente · {metricas.canceladosChofer} por chofer
                </span>
              </div>
            </article>

            <article className="tarjeta kpi-tarjeta">
              <div className="kpi-tarjeta__icono kpi-tarjeta__icono--lila">
                <Clock size={24} aria-hidden="true" />
              </div>
              <div className="kpi-tarjeta__info">
                <span className="kpi-tarjeta__etiqueta">Activos en curso</span>
                <strong className="kpi-tarjeta__valor">{metricas.activos}</strong>
                <span className="kpi-tarjeta__subtexto">En espera o en recorrido</span>
              </div>
            </article>
          </section>

          {metricas.total === 0 ? (
            <Vacio titulo="No hay viajes registrados en el rango de fechas seleccionado">
              <p>Probá ampliando el rango o eligiendo otra fecha desde los filtros superiores.</p>
            </Vacio>
          ) : (
            <div className="metricas-paneles">
              <article className="tarjeta grafico-panel">
                <div className="grafico-panel__cabecera">
                  <div>
                    <h2>Cantidad de viajes por día</h2>
                    <p className="grafico-panel__subtitulo">
                      Evolución diaria del volumen de viajes en el período
                    </p>
                  </div>
                  <div className="grafico-panel__leyenda">
                    <span className="leyenda-item">
                      <span className="leyenda-color" style={{ background: '#362c75' }} /> Total
                    </span>
                    <span className="leyenda-item">
                      <span className="leyenda-color" style={{ background: '#2e7d32' }} /> Finalizados
                    </span>
                    <span className="leyenda-item">
                      <span className="leyenda-color" style={{ background: '#9e4e38' }} /> Cancelados
                    </span>
                  </div>
                </div>

                <div className="grafico-dias">
                  <div className="grafico-dias__columnas">
                    {diasGrafico.map((dia) => {
                      const alturaPct = maxViajesDia > 0 ? (dia.total / maxViajesDia) * 100 : 0
                      const seleccionado = diaSeleccionado === dia.fecha

                      return (
                        <div
                          key={dia.fecha}
                          className={`columna-dia ${seleccionado ? 'columna-dia--seleccionado' : ''}`}
                          onClick={() =>
                            setDiaSeleccionado(seleccionado ? null : dia.fecha)
                          }
                          title={`${dia.etiquetaCompleta}: ${dia.total} viajes (${dia.finalizados} finalizados, ${dia.cancelados} cancelados)`}
                        >
                          <span className="columna-dia__valor">
                            {dia.total > 0 ? dia.total : ''}
                          </span>
                          <div className="columna-dia__barra-contenedor">
                            <div
                              className="columna-dia__barra"
                              style={{
                                height: dia.total > 0 ? `${Math.max(alturaPct, 8)}%` : '2px',
                                background:
                                  dia.total > 0 ? 'var(--indigo)' : 'var(--borde)',
                              }}
                            />
                          </div>
                          <span className="columna-dia__etiqueta">{dia.etiquetaCorta}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {diaSeleccionado && (
                  <div className="detalle-dia tarjeta">
                    {(() => {
                      const d = diasGrafico.find((x) => x.fecha === diaSeleccionado)
                      if (!d) return null
                      return (
                        <div className="detalle-dia__contenido">
                          <strong>Detalle del {d.etiquetaCompleta}:</strong>
                          <span>
                            Total: <strong>{d.total}</strong> viajes
                          </span>
                          <span style={{ color: '#2e7d32' }}>
                            Completados: <strong>{d.finalizados}</strong>
                          </span>
                          <span style={{ color: '#9e4e38' }}>
                            Cancelados: <strong>{d.cancelados}</strong>
                          </span>
                          <span style={{ color: '#362c75' }}>
                            Activos: <strong>{d.activos}</strong>
                          </span>
                          <button
                            type="button"
                            className="btn btn--fantasma btn--chico"
                            onClick={() => setDiaSeleccionado(null)}
                          >
                            Cerrar
                          </button>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </article>

              <article className="tarjeta grafico-panel">
                <div className="grafico-panel__cabecera">
                  <div>
                    <h2>Viajes por estado</h2>
                    <p className="grafico-panel__subtitulo">
                      Distribución y porcentaje de viajes según su estado actual
                    </p>
                  </div>
                  <div className="chips" role="group" aria-label="Filtro de estados">
                    {[
                      { id: 'todos', label: 'Todos' },
                      { id: 'historicos', label: 'Solo Históricos' },
                      { id: 'activos', label: 'Solo Activos' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`chip ${filtroTipoEstado === f.id ? 'chip--activo' : ''}`}
                        onClick={() =>
                          setFiltroTipoEstado(f.id as 'todos' | 'historicos' | 'activos')
                        }
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grafico-estados">
                  {estadosGrafico.conteos.map((item) => {
                    const anchoPct =
                      estadosGrafico.maxCantidad > 0
                        ? (item.cantidad / estadosGrafico.maxCantidad) * 100
                        : 0

                    return (
                      <div key={item.estado} className="barra-estado-fila">
                        <div className="barra-estado-fila__cabecera">
                          <span className="barra-estado-fila__nombre">
                            <span
                              className="barra-estado-fila__punto"
                              style={{ background: item.color }}
                            />
                            {item.etiqueta}
                          </span>
                          <span className="barra-estado-fila__datos">
                            <strong>{item.cantidad}</strong> viajes ({item.porcentaje}%)
                          </span>
                        </div>
                        <div className="barra-estado-fila__pista">
                          <div
                            className="barra-estado-fila__relleno"
                            style={{
                              width: `${anchoPct}%`,
                              background: item.color,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>

              {rankingChoferes.length > 0 && (
                <article className="tarjeta grafico-panel">
                  <div className="grafico-panel__cabecera">
                    <div>
                      <h2>Choferes más activos</h2>
                      <p className="grafico-panel__subtitulo">
                        Top de choferes con mayor volumen en el período seleccionado
                      </p>
                    </div>
                  </div>

                  <div className="tabla-contenedor">
                    <table className="tabla">
                      <thead>
                        <tr>
                          <th>Chofer</th>
                          <th>Total Viajes</th>
                          <th>Completados</th>
                          <th>Cancelados</th>
                          <th>Efectividad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankingChoferes.map((c) => {
                          const efectividad =
                            c.total > 0 ? Math.round((c.finalizados / c.total) * 100) : 0
                          return (
                            <tr key={c.nombre}>
                              <td>
                                <strong>{c.nombre}</strong>
                              </td>
                              <td>{c.total}</td>
                              <td style={{ color: '#2e7d32' }}>{c.finalizados}</td>
                              <td style={{ color: '#9e4e38' }}>{c.cancelados}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div
                                    style={{
                                      width: '60px',
                                      height: '8px',
                                      background: 'var(--borde)',
                                      borderRadius: '4px',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: `${efectividad}%`,
                                        height: '100%',
                                        background: 'var(--verde)',
                                      }}
                                    />
                                  </div>
                                  <span>{efectividad}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </article>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
