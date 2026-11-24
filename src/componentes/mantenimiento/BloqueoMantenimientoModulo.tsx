import { useState, type ReactNode } from 'react'
import { AlertCircle, RefreshCw, Wrench } from 'lucide-react'
import { useMantenimiento } from '../../mantenimiento/useMantenimiento'
import { useSesion } from '../../sesion/contexto'

export function BloqueoMantenimientoModulo({
  scope,
  nombreModulo,
  children,
}: {
  scope: string
  nombreModulo: string
  children: ReactNode
}) {
  const { isScopeBlocked, recargar } = useMantenimiento()
  const { usuario } = useSesion()
  const [reintentando, setReintentando] = useState(false)

  const { blocked, message } = isScopeBlocked(scope)

  const esAdmin =
    usuario?.Rol === 'Duenio' || usuario?.Rol === 'Administrador'

  // Si el usuario es administrador, no se bloquea la vista (bypass de admin para destrabar el sistema)
  if (!blocked || esAdmin) {
    return (
      <>
        {blocked && esAdmin && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
              border: '1px solid #d97706',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
              color: 'var(--color-texto)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} color="#d97706" />
              <span>
                <strong>Aviso de Mantenimiento ({scope}):</strong> {message}.{' '}
                <em>Tenés acceso de bypass habilitado como administrador.</em>
              </span>
            </div>
            <button
              type="button"
              className="btn btn--fantasma btn--chico"
              onClick={() => void recargar()}
              style={{ fontSize: '0.8rem', padding: '2px 8px' }}
            >
              Recargar estado
            </button>
          </div>
        )}
        {children}
      </>
    )
  }

  const handleReintentar = async () => {
    setReintentando(true)
    try {
      await recargar()
    } finally {
      setReintentando(false)
    }
  }

  return (
    <div
      className="tarjeta"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        margin: '1.5rem auto',
        maxWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(217, 119, 6, 0.12)',
          color: '#d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <Wrench size={28} />
      </div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Módulo {nombreModulo} en Mantenimiento
      </h2>

      <p style={{ color: 'var(--color-texto-suave)', marginBottom: '1.75rem', lineHeight: '1.5' }}>
        {message || `El módulo de ${nombreModulo} está temporalmente suspendido por tareas de actualización.`}
      </p>

      <button
        type="button"
        className="btn btn--primario"
        onClick={handleReintentar}
        disabled={reintentando}
      >
        <RefreshCw size={16} className={reintentando ? 'girando' : undefined} />
        {reintentando ? 'Verificando…' : 'Volver a intentar'}
      </button>
    </div>
  )
}
