import { api } from '../../api'
import type { Cliente } from '../../api/tipos'
import { useAccion } from '../../hooks/useAccion'
import { Campo } from '../ui'
import { PieFormulario } from './comun'
import { leerCampos } from './leerCampos'

export function FormularioCliente({
  inicial,
  onGuardado,
  onCancelar,
}: {
  inicial?: Cliente
  onGuardado: (cliente: Cliente) => void
  onCancelar?: () => void
}) {
  const { ocupado, error, ejecutar } = useAccion()

  return (
    <form
      className="formulario"
      onSubmit={(e) => {
        const campo = leerCampos(e)
        const datos = { Telefono: campo('Telefono'), ApellidoYNombre: campo('ApellidoYNombre') }
        void ejecutar(async () => {
          onGuardado(
            inicial
              ? await api.clientes.editar(inicial.IdCliente, datos)
              : await api.clientes.crear(datos),
          )
        })
      }}
    >
      <Campo etiqueta="Apellido y nombre">
        <input name="ApellidoYNombre" required maxLength={191} defaultValue={inicial?.ApellidoYNombre} placeholder="García, María" />
      </Campo>
      <Campo etiqueta="Teléfono">
        <input name="Telefono" type="tel" required maxLength={191} defaultValue={inicial?.Telefono} />
      </Campo>
      <PieFormulario ocupado={ocupado} error={error} onCancelar={onCancelar} />
    </form>
  )
}
