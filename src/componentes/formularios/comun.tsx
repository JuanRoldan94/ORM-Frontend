import { Aviso } from '../ui'

export function PieFormulario({
  ocupado,
  error,
  textoGuardar = 'Guardar',
  onCancelar,
  deshabilitado = false,
}: {
  ocupado: boolean
  error: string | null
  textoGuardar?: string
  onCancelar?: () => void
  deshabilitado?: boolean
}) {
  return (
    <>
      {error && <Aviso>{error}</Aviso>}
      <div className="formulario__pie">
        {onCancelar && (
          <button type="button" className="btn btn--fantasma" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn--primario" disabled={ocupado || deshabilitado}>
          {ocupado ? 'Guardando…' : textoGuardar}
        </button>
      </div>
    </>
  )
}
