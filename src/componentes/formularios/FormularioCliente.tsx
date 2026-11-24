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
  const { ocupado, error, setError, ejecutar } = useAccion()

  return (
    <form
      className="formulario"
      onSubmit={(e) => {
        const campo = leerCampos(e)
        const telefono = campo('Telefono').trim()
        if (!/^\+?[0-9\s\-()]{6,20}$/.test(telefono)) {
          setError('El teléfono debe tener un formato válido (entre 6 y 20 caracteres numéricos)')
          return
        }
        const datos = { Telefono: telefono, ApellidoYNombre: campo('ApellidoYNombre') }
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
      <Campo etiqueta="Teléfono" ayuda="Ej: 341 555-1234">
        <input
          name="Telefono"
          type="tel"
          required
          pattern="^\+?[0-9\s\-()]{6,20}$"
          title="Entre 6 y 20 caracteres numéricos"
          maxLength={191}
          defaultValue={inicial?.Telefono}
        />
      </Campo>
      <PieFormulario ocupado={ocupado} error={error} onCancelar={onCancelar} />
    </form>
  )
}
