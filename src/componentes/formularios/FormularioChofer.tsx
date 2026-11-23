import { api } from '../../api'
import type { Chofer, DatosChofer } from '../../api/tipos'
import { aInputFechaHora, deInputFechaHora } from '../../dominio/formato'
import { useAccion } from '../../hooks/useAccion'
import { useCarga } from '../../hooks/useCarga'
import { InsigniaChofer } from '../Insignias'
import { Campo } from '../ui'
import { PieFormulario } from './comun'
import { leerCampos } from './leerCampos'

export function FormularioChofer({
  inicial,
  onGuardado,
  onCancelar,
}: {
  inicial?: Chofer
  onGuardado: (chofer: Chofer) => void
  onCancelar?: () => void
}) {
  const { ocupado, error, setError, ejecutar } = useAccion()
  const { datos: vehiculos } = useCarga(
    () => (inicial ? Promise.resolve([]) : api.vehiculos.listar()),
    'vehiculos-form-chofer',
  )
  const viajesActivos = inicial?.Viajes?.length ?? 0
  const enViaje = inicial?.EstadoChofer === 'EnViaje' || viajesActivos > 0

  return (
    <form
      className="formulario"
      onSubmit={(e) => {
        const campo = leerCampos(e)
        const ingreso = campo('IngresoTurno')
        const fin = campo('FinalizacionTurno')
        if (new Date(fin) <= new Date(ingreso)) {
          setError('La finalización del turno tiene que ser posterior al ingreso')
          return
        }
        const maxViajes = Number(campo('MaxViajes')) || 1
        const datos: DatosChofer = {
          Nombre: campo('Nombre'),
          Apellido: campo('Apellido'),
          NumeroLicencia: campo('NumeroLicencia'),
          Telefono: campo('Telefono'),
          EstadoChofer: campo('EstadoChofer') as DatosChofer['EstadoChofer'],
          IngresoTurno: deInputFechaHora(ingreso),
          FinalizacionTurno: deInputFechaHora(fin),
          MaxViajes: maxViajes,
        }
        const idVehiculo = campo('IdVehiculoActual')
        void ejecutar(async () => {
          if (inicial) {
            const { EstadoChofer, ...resto } = datos
            onGuardado(
              await api.choferes.editar(
                inicial.IdChofer,
                enViaje ? resto : { ...resto, EstadoChofer },
              ),
            )
          } else {
            onGuardado(
              await api.choferes.crear({
                ...datos,
                IdVehiculoActual: idVehiculo ? Number(idVehiculo) : undefined,
              }),
            )
          }
        })
      }}
    >
      <div className="formulario__fila">
        <Campo etiqueta="Nombre">
          <input name="Nombre" required maxLength={191} defaultValue={inicial?.Nombre} />
        </Campo>
        <Campo etiqueta="Apellido">
          <input name="Apellido" required maxLength={191} defaultValue={inicial?.Apellido} />
        </Campo>
      </div>
      <div className="formulario__fila">
        <Campo etiqueta="N° de licencia">
          <input name="NumeroLicencia" required maxLength={191} defaultValue={inicial?.NumeroLicencia} />
        </Campo>
        <Campo etiqueta="Teléfono">
          <input name="Telefono" type="tel" required maxLength={191} defaultValue={inicial?.Telefono} />
        </Campo>
      </div>
      <div className="formulario__fila">
        {enViaje ? (
          <Campo
            etiqueta="Estado"
            ayuda="Tiene viajes activos asignados: volverá a estar Libre automáticamente cuando finalicen todos los viajes."
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <InsigniaChofer estado="EnViaje" />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-texto-suave)' }}>
                ({viajesActivos} {viajesActivos === 1 ? 'viaje activo' : 'viajes activos'})
              </span>
            </div>
          </Campo>
        ) : (
          <Campo etiqueta="Estado">
            <select
              name="EstadoChofer"
              required
              defaultValue={inicial?.EstadoChofer ?? 'Libre'}
            >
              <option value="Libre">Libre</option>
              <option value="FueraDeServicio">Fuera de servicio</option>
              <option value="Vacaciones">Vacaciones</option>
            </select>
          </Campo>
        )}
        <Campo
          etiqueta="Máx. viajes simultáneos"
          ayuda={
            inicial
              ? `Cupo actual en uso: ${viajesActivos} de ${inicial.MaxViajes ?? 1} viajes activos`
              : 'Cantidad de viajes que puede tener asignados a la vez'
          }
        >
          <input
            name="MaxViajes"
            type="number"
            min={Math.max(1, viajesActivos)}
            max={10}
            required
            defaultValue={inicial?.MaxViajes ?? 1}
          />
        </Campo>
      </div>
      <div className="formulario__fila">
        <Campo etiqueta="Ingreso al turno">
          <input
            name="IngresoTurno"
            type="datetime-local"
            required
            defaultValue={inicial ? aInputFechaHora(inicial.IngresoTurno) : undefined}
          />
        </Campo>
        <Campo etiqueta="Fin del turno">
          <input
            name="FinalizacionTurno"
            type="datetime-local"
            required
            defaultValue={inicial ? aInputFechaHora(inicial.FinalizacionTurno) : undefined}
          />
        </Campo>
      </div>
      {!inicial && (
        <Campo etiqueta="Vehículo (opcional)" ayuda="Solo se pueden asignar vehículos en estado Operativo.">
          <select name="IdVehiculoActual" defaultValue="">
            <option value="">Sin vehículo por ahora</option>
            {vehiculos
              ?.filter((v) => v.EstadoOperativo === 'Operativo')
              .map((v) => (
                <option key={v.IdVehiculo} value={v.IdVehiculo}>
                  {v.Patente} · {v.Marca} {v.Modelo}
                </option>
              ))}
          </select>
        </Campo>
      )}
      <PieFormulario ocupado={ocupado} error={error} onCancelar={onCancelar} />
    </form>
  )
}
