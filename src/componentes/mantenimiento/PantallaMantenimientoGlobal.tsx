import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AlertTriangle, LogIn, RefreshCw, ShieldAlert, UserCog } from 'lucide-react'
import { api } from '../../api'
import type { Usuario } from '../../api/tipos'
import { useCarga } from '../../hooks/useCarga'
import { useMantenimiento } from '../../mantenimiento/useMantenimiento'
import { useSesion } from '../../sesion/contexto'

export function PantallaMantenimientoGlobal() {
  const { globalMessage, recargar } = useMantenimiento()
  const { usuario, ingresar } = useSesion()
  const navegar = useNavigate()
  const [reintentando, setReintentando] = useState(false)
  const [mostrarLoginAdmin, setMostrarLoginAdmin] = useState(false)

  const { datos: usuarios, cargando: cargandoUsuarios } = useCarga(
    () => api.usuarios.listar(),
    'usuarios-mantenimiento',
  )

  const handleReintentar = async () => {
    setReintentando(true)
    try {
      await recargar()
    } finally {
      setReintentando(false)
    }
  }

  const esAdmin =
    usuario?.Rol === 'Duenio' || usuario?.Rol === 'Administrador'

  const administradores = (usuarios ?? []).filter(
    (u) => u.Rol === 'Duenio' || u.Rol === 'Administrador',
  )

  const handleIngresarComoAdmin = (u: Usuario) => {
    ingresar(u)
    setMostrarLoginAdmin(false)
    navegar('/admin/mantenimiento')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: 'var(--color-fondo)',
        color: 'var(--color-texto)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '540px',
          backgroundColor: 'var(--color-tarjeta)',
          padding: '2.5rem',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          border: '1px solid var(--color-borde)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(217, 119, 6, 0.15)',
            color: '#d97706',
            marginBottom: '1.5rem',
          }}
        >
          <AlertTriangle size={36} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Sistema en Mantenimiento
        </h1>

        <p style={{ color: 'var(--color-texto-suave)', fontSize: '1rem', lineHeight: '1.5', marginBottom: '2rem' }}>
          {globalMessage || 'Estamos realizando tareas de mantenimiento programadas para mejorar el servicio. Por favor, volvé a intentar en unos minutos.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn--primario"
            onClick={handleReintentar}
            disabled={reintentando}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <RefreshCw size={18} className={reintentando ? 'girando' : undefined} />
            {reintentando ? 'Comprobando estado…' : 'Reintentar conexión'}
          </button>

          {esAdmin ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(217, 119, 6, 0.08)',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--color-texto)',
                }}
              >
                <ShieldAlert size={18} color="#d97706" />
                <span>
                  Sesión iniciada como <strong>{usuario?.Nombre}</strong> ({usuario?.Rol}). Tenés acceso para destrabar el sistema.
                </span>
              </div>
              <Link
                to="/admin/mantenimiento"
                className="btn btn--primario btn--ancho"
                style={{ justifyContent: 'center' }}
              >
                Abrir Panel de Control de Mantenimiento
              </Link>
            </div>
          ) : (
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-borde)',
                width: '100%',
              }}
            >
              {!mostrarLoginAdmin ? (
                <button
                  type="button"
                  className="btn btn--fantasma btn--chico"
                  onClick={() => setMostrarLoginAdmin(true)}
                  style={{ margin: '0 auto', fontSize: '0.875rem' }}
                >
                  <UserCog size={16} />
                  ¿Sos Administrador? Ingresá para restaurar el sistema
                </button>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--color-fondo)',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-borde)',
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      Seleccioná un Administrador:
                    </span>
                    <button
                      type="button"
                      className="btn btn--fantasma btn--chico"
                      onClick={() => setMostrarLoginAdmin(false)}
                      style={{ fontSize: '0.75rem', padding: '2px 6px' }}
                    >
                      Cancelar
                    </button>
                  </div>

                  {cargandoUsuarios ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-suave)' }}>
                      Cargando administradores…
                    </p>
                  ) : administradores.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-texto-suave)' }}>
                      No se encontraron usuarios administradores.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {administradores.map((admin) => (
                        <button
                          key={admin.IdUsuario}
                          type="button"
                          className="fila-boton"
                          onClick={() => handleIngresarComoAdmin(admin)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid var(--color-borde)',
                            backgroundColor: 'var(--color-tarjeta)',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <div>
                            <strong>{admin.Nombre}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-texto-suave)' }}>
                              {admin.Mail} ({admin.Rol})
                            </div>
                          </div>
                          <LogIn size={16} color="var(--color-primario)" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
