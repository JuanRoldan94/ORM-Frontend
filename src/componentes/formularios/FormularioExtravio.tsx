import { api } from '../../api'
import type { Extravio } from '../../api/tipos'
import { useAccion } from '../../hooks/useAccion'
import { Campo } from '../ui'
import { PieFormulario } from './comun'
import { leerCampos } from './leerCampos'

// Al crear se indica el viaje; el cliente es siempre el del viaje.
export function FormularioExtravio({
  viaje,
  inicial,
  onGuardado,
  onCancelar,
}: {
  viaje?: { IdViaje: number; IdCliente: number }
  inicial?: Extravio
  onGuardado: () => void
  onCancelar?: () => void
}) {
  const { ocupado, error, ejecutar } = useAccion()

  return (
    <form
      className="formulario"
      onSubmit={(e) => {
        const Descripcion = leerCampos(e)('Descripcion')
        void ejecutar(async () => {
          if (inicial) await api.extravios.editar(inicial.IdExtravio, { Descripcion })
          else if (viaje) await api.extravios.crear({ Descripcion, ...viaje })
          onGuardado()
        })
      }}
    >
      <Campo etiqueta="¿Qué se olvidó?">
        <textarea
          name="Descripcion"
          required
          rows={4}
          maxLength={5000}
          defaultValue={inicial?.Descripcion}
          placeholder="Ej.: paraguas negro con mango de madera"
        />
      </Campo>
      <PieFormulario ocupado={ocupado} error={error} onCancelar={onCancelar} />
    </form>
  )
}
