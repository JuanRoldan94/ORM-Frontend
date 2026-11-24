import { useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeft,
  CheckCircle2,
  Power,
  RefreshCw,
  Save,
  Wrench,
} from 'lucide-react'
import { api } from '../api'
import type { ScopeMantenimientoCompleto } from '../api/tipos'
import { Aviso, Cargando, Encabezado } from '../componentes/ui'
import { useAccion } from '../hooks/useAccion'
import { useCarga } from '../hooks/useCarga'
import { useMantenimiento } from '../mantenimiento/useMantenimiento'
import { useSesion } from '../sesion/contexto'

export function AdminMantenimiento() {
  const { usuario } = useSesion()
  const { recargar: recargarContexto } = useMantenimiento()
  const accion = useAccion()

  const { datos, cargando, error, recargar } = useCarga(
    () => api.mantenimiento.obtenerEstado(),
    'admin-mantenimiento-status',
  )

  const [mensajesEditados, setMensajesEditados] = useState<Record<string, string>>({})
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  const esAdmin =
    usuario?.Rol === 'Duenio' || usuario?.Rol === 'Administrador'

  if (!esAdmin) {
    return (
      <Aviso
        tipo="error"
        accion={
          <Link to="/" className="btn btn--secundario btn--chico">
            Volver al inicio
          </Link>
        }
      >
        Acceso restringido. Solo los usuarios con rol Dueño o Administrador pueden acceder a este panel.
      </Aviso>
    )
  }

  const handleToggle = (scope: string, nuevoEstado: boolean) => {
    accion.ejecutar(async () => {
      setMensajeExito(null)
      const mensaje = mensajesEditados[scope]
      await api.mantenimiento.actualizarScope(scope, {
        isActive: nuevoEstado,
        message: mensaje,
      })
      await recargar()
      await recargarContexto()
      setMensajeExito(
        `Scope "${scope}" ${nuevoEstado ? 'puesto en Mantenimiento' : 'reactivado con normalidad'}.`,
      )
    })
  }

  const handleGuardarMensaje = (scope: string, estadoActual: boolean) => {
    accion.ejecutar(async () => {
      setMensajeExito(null)
      const mensaje = mensajesEditados[scope]
      if (!mensaje?.trim()) return
      await api.mantenimiento.actualizarScope(scope, {
        isActive: estadoActual,
        message: mensaje.trim(),
      })
      await recargar()
      await recargarContexto()
      setMensajeExito(`Mensaje actualizado para el scope "${scope}".`)
    })
  }

  const scopes = datos?.allScopes ?? []
  const globalScope = scopes.find((s) => s.scope === 'GLOBAL')
  const moduloScopes = scopes.filter((s) => s.scope !== 'GLOBAL')

  return (
    <>
      <Link to="/" className="volver">
        <ArrowLeft size={18} aria-hidden="true" />
        Volver al Panel
      </Link>

      <Encabezado
        titulo="Control de Mantenimiento"
        subtitulo="Panel de administración para activar o suspender el servicio general o módulos específicos."
        acciones={
          <button
            type="button"
            className="btn-icono btn-icono--borde"
            onClick={() => {
              void recargar()
              void recargarContexto()
            }}
            disabled={cargando || accion.ocupado}
            title="Refrescar estado"
            aria-label="Refrescar estado"
          >
            <RefreshCw size={18} className={cargando ? 'girando' : undefined} />
          </button>
        }
      />

      {mensajeExito && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            color: 'var(--color-texto)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} color="#22c55e" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {error && <Aviso tipo="error">{error}</Aviso>}
      {accion.error && <Aviso tipo="error">{accion.error}</Aviso>}

      {cargando && !datos ? (
        <Cargando />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* SECCIÓN MODO GLOBAL */}
          {globalScope && (
            <section
              className="tarjeta"
              style={{
                border: globalScope.isActive
                  ? '2px solid #ef4444'
                  : '1px solid var(--color-borde)',
                backgroundColor: globalScope.isActive
                  ? 'rgba(239, 68, 68, 0.05)'
                  : 'var(--color-tarjeta)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: globalScope.isActive
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(34, 197, 94, 0.15)',
                      color: globalScope.isActive ? '#ef4444' : '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Power size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>
                      Mantenimiento Global del Sistema
                    </h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-texto-suave)' }}>
                      {globalScope.isActive
                        ? 'El sistema está BLOQUEADO para operadores y clientes (Modo Mantenimiento Activo).'
                        : 'El sistema está Operativo y accesible para todos los usuarios.'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn ${
                    globalScope.isActive ? 'btn--secundario' : 'btn--peligro'
                  }`}
                  disabled={accion.ocupado}
                  onClick={() => handleToggle('GLOBAL', !globalScope.isActive)}
                  style={{ minWidth: '180px' }}
                >
                  <Power size={16} />
                  {globalScope.isActive
                    ? 'Desactivar y Restaurar'
                    : 'Poner Todo en Mantenimiento'}
                </button>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label
                  htmlFor="msg-GLOBAL"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    marginBottom: '0.35rem',
                    color: 'var(--color-texto-suave)',
                  }}
                >
                  Mensaje público mostrado en pantalla:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    id="msg-GLOBAL"
                    type="text"
                    style={{ flex: 1, minWidth: '260px' }}
                    defaultValue={globalScope.message}
                    onChange={(e) =>
                      setMensajesEditados((prev) => ({
                        ...prev,
                        GLOBAL: e.target.value,
                      }))
                    }
                    placeholder="Escribí el motivo del mantenimiento global…"
                  />
                  <button
                    type="button"
                    className="btn btn--secundario btn--chico"
                    disabled={accion.ocupado}
                    onClick={() => handleGuardarMensaje('GLOBAL', globalScope.isActive)}
                  >
                    <Save size={16} />
                    Guardar mensaje
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* SECCIÓN SCOPES POR MÓDULO */}
          <section className="tarjeta">
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>
                Mantenimiento por Módulos Individuales
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-texto-suave)', marginTop: '0.25rem' }}>
                Permite suspender solo un área sin bloquear el resto de las operaciones de la remisería.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {moduloScopes.map((item: ScopeMantenimientoCompleto) => {
                const enMantenimiento = item.isActive
                return (
                  <div
                    key={item.scope}
                    style={{
                      border: '1px solid var(--color-borde)',
                      borderRadius: '8px',
                      padding: '1rem 1.25rem',
                      backgroundColor: enMantenimiento
                        ? 'rgba(217, 119, 6, 0.05)'
                        : 'transparent',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Wrench
                          size={18}
                          color={enMantenimiento ? '#d97706' : 'var(--color-texto-suave)'}
                        />
                        <strong style={{ fontSize: '1rem' }}>Módulo {item.scope}</strong>
                        <span
                          className={`badge ${
                            enMantenimiento ? 'badge--oxido' : 'badge--verde'
                          }`}
                        >
                          {enMantenimiento ? 'En Mantenimiento' : 'Operativo'}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`btn btn--chico ${
                          enMantenimiento ? 'btn--secundario' : 'btn--primario'
                        }`}
                        disabled={accion.ocupado}
                        onClick={() => handleToggle(item.scope, !enMantenimiento)}
                      >
                        {enMantenimiento ? 'Restaurar módulo' : 'Suspender módulo'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        style={{ flex: 1, minWidth: '220px', fontSize: '0.875rem' }}
                        defaultValue={item.message}
                        onChange={(e) =>
                          setMensajesEditados((prev) => ({
                            ...prev,
                            [item.scope]: e.target.value,
                          }))
                        }
                        placeholder={`Mensaje para los usuarios al acceder a ${item.scope}…`}
                      />
                      <button
                        type="button"
                        className="btn btn--fantasma btn--chico"
                        disabled={accion.ocupado}
                        onClick={() => handleGuardarMensaje(item.scope, enMantenimiento)}
                        title="Guardar nuevo mensaje"
                      >
                        <Save size={14} />
                        Guardar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}
    </>
  )
}
