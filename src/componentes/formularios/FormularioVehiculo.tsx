import { api } from '../../api'
import type { DatosVehiculo, EstadoOperativo, Vehiculo } from '../../api/tipos'
import { ESTADO_OPERATIVO } from '../../dominio/estados'
import { useAccion } from '../../hooks/useAccion'
import { Campo } from '../ui'
import { PieFormulario } from './comun'
import { leerCampos } from './leerCampos'

export function FormularioVehiculo({
  inicial,
  onGuardado,
  onCancelar,
}: {
  inicial?: Vehiculo
  onGuardado: (vehiculo: Vehiculo) => void
  onCancelar?: () => void
}) {
  const { ocupado, error, ejecutar } = useAccion()

  return (
    <form
      className="formulario"
      onSubmit={(e) => {
        const campo = leerCampos(e)
        const datos: DatosVehiculo = {
          Patente: campo('Patente').toUpperCase(),
          Marca: campo('Marca'),
          Modelo: campo('Modelo'),
          EstadoOperativo: campo('EstadoOperativo') as EstadoOperativo,
        }
        void ejecutar(async () => {
          onGuardado(
            inicial
              ? await api.vehiculos.editar(inicial.IdVehiculo, datos)
              : await api.vehiculos.crear(datos),
          )
        })
      }}
    >
      <Campo etiqueta="Patente">
        <input
          name="Patente"
          required
          maxLength={20}
          defaultValue={inicial?.Patente}
          placeholder="AB123CD"
          className="input--mayusculas"
          autoCapitalize="characters"
        />
      </Campo>
      <div className="formulario__fila">
        <Campo etiqueta="Marca">
          <input name="Marca" required maxLength={191} defaultValue={inicial?.Marca} />
        </Campo>
        <Campo etiqueta="Modelo">
          <input name="Modelo" required maxLength={191} defaultValue={inicial?.Modelo} />
        </Campo>
      </div>
      <Campo etiqueta="Estado del vehículo">
        <select name="EstadoOperativo" required defaultValue={inicial?.EstadoOperativo ?? 'Operativo'}>
          {(Object.keys(ESTADO_OPERATIVO) as EstadoOperativo[]).map((e) => (
            <option key={e} value={e}>
              {ESTADO_OPERATIVO[e].etiqueta}
            </option>
          ))}
        </select>
      </Campo>
      <PieFormulario ocupado={ocupado} error={error} onCancelar={onCancelar} />
    </form>
  )
}
