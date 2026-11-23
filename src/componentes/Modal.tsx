import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

// En el celular se abre como panel desde abajo; en pantallas grandes, centrado.
export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
}: {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      onClick={(e) => {
        // clic en el fondo oscuro
        if (e.target === ref.current) onCerrar()
      }}
    >
      <div className="modal__contenido">
        <header className="modal__encabezado">
          <h2 id={idTitulo}>{titulo}</h2>
          <button type="button" className="btn-icono" onClick={onCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>
        {abierto && children}
      </div>
    </dialog>
  )
}
