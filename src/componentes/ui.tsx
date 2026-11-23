import { useState, type ReactNode } from 'react'
import type { Tono } from '../dominio/estados'

export function Encabezado({
  titulo,
  subtitulo,
  acciones,
}: {
  titulo: string
  subtitulo?: ReactNode
  acciones?: ReactNode
}) {
  return (
    <div className="encabezado">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p className="encabezado__subtitulo">{subtitulo}</p>}
      </div>
      {acciones && <div className="encabezado__acciones">{acciones}</div>}
    </div>
  )
}

export function Badge({ tono, children }: { tono: Tono; children: ReactNode }) {
  return <span className={`badge badge--${tono}`}>{children}</span>
}

export function Aviso({
  tipo = 'error',
  children,
  accion,
}: {
  tipo?: 'error' | 'info'
  children: ReactNode
  accion?: ReactNode
}) {
  return (
    <div className={`aviso aviso--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <div className="aviso__texto">{children}</div>
      {accion}
    </div>
  )
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="cargando" role="status">
      <span className="spinner" aria-hidden="true" />
      {texto}
    </div>
  )
}

export function Vacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="vacio">
      <p className="vacio__titulo">{titulo}</p>
      {children}
    </div>
  )
}

export function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string
  ayuda?: ReactNode
  children: ReactNode
}) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">{etiqueta}</span>
      {children}
      {ayuda && <span className="campo__ayuda">{ayuda}</span>}
    </label>
  )
}

export interface OpcionChip<T extends string> {
  valor: T
  etiqueta: string
  cantidad?: number
}

export function Chips<T extends string>({
  opciones,
  valor,
  onCambiar,
  etiqueta,
}: {
  opciones: OpcionChip<T>[]
  valor: T
  onCambiar: (valor: T) => void
  etiqueta: string
}) {
  return (
    <div className="chips" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          className="chip"
          aria-pressed={o.valor === valor}
          onClick={() => onCambiar(o.valor)}
        >
          {o.etiqueta}
          {o.cantidad !== undefined && <span className="chip__cantidad">{o.cantidad}</span>}
        </button>
      ))}
    </div>
  )
}

// Pide confirmación en el mismo lugar del botón antes de una acción destructiva.
export function BotonConfirmar({
  children,
  pregunta = '¿Seguro?',
  onConfirmar,
  className = 'btn btn--peligro-suave',
  disabled,
}: {
  children: ReactNode
  pregunta?: string
  onConfirmar: () => void
  className?: string
  disabled?: boolean
}) {
  const [confirmando, setConfirmando] = useState(false)

  if (confirmando) {
    return (
      <span className="confirmar">
        <span className="confirmar__pregunta">{pregunta}</span>
        <button
          type="button"
          className="btn btn--peligro btn--chico"
          onClick={() => {
            setConfirmando(false)
            onConfirmar()
          }}
        >
          Sí
        </button>
        <button
          type="button"
          className="btn btn--fantasma btn--chico"
          onClick={() => setConfirmando(false)}
        >
          No
        </button>
      </span>
    )
  }
  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      onClick={() => setConfirmando(true)}
    >
      {children}
    </button>
  )
}
