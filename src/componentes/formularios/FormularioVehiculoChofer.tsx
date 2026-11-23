import { api } from '../../api'
import type { Chofer } from '../../api/tipos'
import { useAccion } from '../../hooks/useAccion'
import { useCarga } from '../../hooks/useCarga'
import { Campo, Cargando } from '../ui'
import { PieFormulario } from './comun'
import { leerCampos } from './leerCampos'

// RF-4: asignar un vehículo específico a un chofer.
export function FormularioVehiculoChofer({
  chofer,
  onGuardado,
  onCancelar,
}: {
  chofer: Chofer
  onGuardado: () => void
  onCancelar?: () => void
}) {
  const { ocupado, error, ejecutar } = useAccion()
  const { datos: vehiculos, cargando } = useCarga(() => api.vehiculos.listar(), 'vehiculos')

  if (cargando && !vehiculos) return <Cargando />

  const vehiculosOperativos = vehiculos?.filter((v) => v.EstadoOperativo === 'Operativo') ?? []
  const vehiculoActualNoOperativo =
    chofer.VehiculoActual && chofer.VehiculoActual.EstadoOperativo !== 'Operativo'

  return (
    <form
      className="formulario"
      onSubmit={(e) => {
        const id = leerCampos(e)('IdVehiculo')
        void ejecutar(async () => {
          await api.choferes.asignarVehiculo(chofer.IdChofer, id ? Number(id) : null)
          onGuardado()
        })
      }}
    >
      <Campo
        etiqueta={`Vehículo de ${chofer.Nombre} ${chofer.Apellido}`}
        ayuda={
          vehiculoActualNoOperativo
            ? `Atención: El vehículo actual (${chofer.VehiculoActual?.Patente}) está No operativo.`
            : 'Solo se pueden asignar vehículos en estado Operativo.'
        }
      >
        <select
          name="IdVehiculo"
          defaultValue={vehiculoActualNoOperativo ? '' : (chofer.IdVehiculoActual ?? '')}
        >
          <option value="">Sin vehículo</option>
          {vehiculosOperativos.map((v) => (
            <option key={v.IdVehiculo} value={v.IdVehiculo}>
              {v.Patente} · {v.Marca} {v.Modelo}
            </option>
          ))}
        </select>
      </Campo>
      <PieFormulario ocupado={ocupado} error={error} onCancelar={onCancelar} />
    </form>
  )
}
