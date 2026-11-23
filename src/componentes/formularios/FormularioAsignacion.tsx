import { useState } from 'react'
import { Link } from 'react-router'
import { AlertCircle, Car, CheckCircle2, Info } from 'lucide-react'
import { api } from '../../api'
import type { Viaje } from '../../api/tipos'
import { useAccion } from '../../hooks/useAccion'
import { useCarga } from '../../hooks/useCarga'
import { Aviso, Campo, Cargando, Vacio } from '../ui'
import { PieFormulario } from './comun'

export function FormularioAsignacion({
  viaje,
  onGuardado,
  onCancelar,
}: {
  viaje: Viaje
  onGuardado: () => void
  onCancelar?: () => void
}) {
  const { ocupado, error, setError, ejecutar } = useAccion()
  const choferesCarga = useCarga(() => api.choferes.listar(), 'choferes-asignacion')
  const [idChofer, setIdChofer] = useState<number | null>(() => viaje.IdChofer ?? null)

  if (choferesCarga.cargando && !choferesCarga.datos) return <Cargando />
  if (choferesCarga.error) return <Aviso>{choferesCarga.error}</Aviso>

  const choferesDisponibles = (choferesCarga.datos ?? []).filter((c) => {
    if (c.EstadoChofer === 'FueraDeServicio' || c.EstadoChofer === 'Vacaciones') {
      return false
    }
    const otrosViajesActivos =
      c.Viajes?.filter((v) => v.IdViaje !== viaje.IdViaje).length ?? 0
    const maxViajes = c.MaxViajes ?? 1
    return otrosViajesActivos < maxViajes
  })

  if (!choferesDisponibles.length) {
    return (
      <Vacio titulo="No hay choferes disponibles">
        <p>
          No hay choferes disponibles para recibir viajes. Los choferes no deben estar Fuera de
          servicio ni de Vacaciones, y no deben haber alcanzado su límite máximo de viajes
          simultáneos.
        </p>
        <Link to="/choferes" className="btn btn--secundario">
          Ver choferes
        </Link>
      </Vacio>
    )
  }

  const chofer = choferesDisponibles.find((c) => c.IdChofer === idChofer)
  const tieneVehiculo = Boolean(chofer?.VehiculoActual)
  const vehiculoOperativo = chofer?.VehiculoActual?.EstadoOperativo === 'Operativo'
  const yaTieneOtroViajeActivo =
    (chofer?.Viajes?.filter((v) => v.IdViaje !== viaje.IdViaje).length ?? 0) > 0
  const puedeAsignar = chofer && tieneVehiculo && vehiculoOperativo

  return (
    <form
      className="formulario"
      onSubmit={(e) => {
        e.preventDefault()
        if (!chofer) {
          setError('Elegí un chofer para el viaje')
          return
        }
        if (!tieneVehiculo) {
          setError(
            `El chofer ${chofer.Nombre} ${chofer.Apellido} no tiene ningún vehículo asignado. Asignale un vehículo antes de asignarle un viaje.`,
          )
          return
        }
        if (!vehiculoOperativo) {
          setError(
            `El vehículo asignado al chofer (${chofer.VehiculoActual?.Patente}) está No operativo. Cambialo por uno operativo antes de asignarle un viaje.`,
          )
          return
        }
        void ejecutar(async () => {
          await api.viajes.asignar(viaje.IdViaje, {
            IdChofer: chofer.IdChofer,
          })
          onGuardado()
        })
      }}
    >
      <Campo
        etiqueta="Chofer"
        ayuda="Seleccioná el chofer para este viaje de la lista de choferes disponibles"
      >
        <select
          name="IdChofer"
          value={idChofer ?? ''}
          onChange={(e) => setIdChofer(e.target.value ? Number(e.target.value) : null)}
          required
        >
          <option value="">Seleccionar un chofer…</option>
          {choferesDisponibles.map((c) => {
            const vehiculoOp = c.VehiculoActual?.EstadoOperativo === 'Operativo'
            const cantOtrosActivos =
              c.Viajes?.filter((v) => v.IdViaje !== viaje.IdViaje).length ?? 0
            const limite = c.MaxViajes ?? 1
            const vehiculoTexto = c.VehiculoActual
              ? vehiculoOp
                ? `${c.VehiculoActual.Patente} · ${c.VehiculoActual.Marca} ${c.VehiculoActual.Modelo}`
                : `${c.VehiculoActual.Patente} (No operativo)`
              : 'Sin vehículo'
            const estadoCupo =
              cantOtrosActivos === 0
                ? 'Libre'
                : `Con viaje activo (${cantOtrosActivos}/${limite})`
            return (
              <option key={c.IdChofer} value={c.IdChofer}>
                {c.Nombre} {c.Apellido} — {vehiculoTexto} [{estadoCupo}]
              </option>
            )
          })}
        </select>
      </Campo>

      <Campo
        etiqueta="Vehículo asignado al viaje"
        ayuda="Se autocompleta con el vehículo que el chofer tiene asignado en el momento."
      >
        <div
          className={`input-autocompletado ${
            !chofer
              ? 'input-autocompletado--vacio'
              : !tieneVehiculo || !vehiculoOperativo
                ? 'input-autocompletado--error'
                : 'input-autocompletado--activo'
          }`}
        >
          <Car size={18} aria-hidden="true" className="input-autocompletado__icono" />
          <span className="input-autocompletado__texto">
            {chofer ? (
              chofer.VehiculoActual ? (
                `${chofer.VehiculoActual.Patente} · ${chofer.VehiculoActual.Marca} ${chofer.VehiculoActual.Modelo}`
              ) : (
                'Sin vehículo asignado al chofer'
              )
            ) : (
              'Seleccioná un chofer arriba para autocompletar su vehículo'
            )}
          </span>
          {chofer && tieneVehiculo && (
            <span
              className={`badge ${vehiculoOperativo ? 'badge--verde-claro' : 'badge--oxido'}`}
            >
              {vehiculoOperativo ? (
                <>
                  <CheckCircle2 size={12} style={{ marginRight: 4 }} />
                  Operativo
                </>
              ) : (
                <>
                  <AlertCircle size={12} style={{ marginRight: 4 }} />
                  No operativo
                </>
              )}
            </span>
          )}
        </div>
      </Campo>

      {chofer && yaTieneOtroViajeActivo && (
        <Aviso tipo="info">
          <Info size={16} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 6 }} />
          El chofer <strong>{chofer.Nombre} {chofer.Apellido}</strong> ya tiene otro viaje activo. Este
          viaje se guardará como <strong>viaje pendiente</strong> en su cola y se activará cuando
          complete el actual.
        </Aviso>
      )}

      {chofer && (!tieneVehiculo || !vehiculoOperativo) && (
        <Aviso tipo="error">
          {!tieneVehiculo ? (
            <>
              Este chofer no tiene un vehículo asignado. Podés asignarle uno desde la pestaña{' '}
              <Link to="/choferes" className="enlace-destacado">
                Choferes
              </Link>
              .
            </>
          ) : (
            'El vehículo del chofer no se encuentra en estado Operativo y no puede ser usado en un viaje.'
          )}
        </Aviso>
      )}

      <PieFormulario
        ocupado={ocupado}
        error={error}
        onCancelar={onCancelar}
        textoGuardar={viaje.Chofer ? 'Reasignar viaje' : 'Asignar viaje'}
        deshabilitado={!puedeAsignar}
      />
    </form>
  )
}
