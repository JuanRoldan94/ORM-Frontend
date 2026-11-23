import type { EstadoChofer, EstadoDeViaje, EstadoOperativo, Rol } from '../api/tipos'
import { ESTADO_CHOFER, ESTADO_OPERATIVO, ESTADO_VIAJE, ROL } from '../dominio/estados'
import { Badge } from './ui'

export function InsigniaViaje({ estado }: { estado: EstadoDeViaje }) {
  const { etiqueta, tono } = ESTADO_VIAJE[estado]
  return <Badge tono={tono}>{etiqueta}</Badge>
}

export function InsigniaChofer({ estado }: { estado: EstadoChofer }) {
  const { etiqueta, tono } = ESTADO_CHOFER[estado]
  return <Badge tono={tono}>{etiqueta}</Badge>
}

export function InsigniaVehiculo({ estado }: { estado: EstadoOperativo }) {
  const { etiqueta, tono } = ESTADO_OPERATIVO[estado]
  return <Badge tono={tono}>{etiqueta}</Badge>
}

export function InsigniaRol({ rol }: { rol: Rol }) {
  const { etiqueta, tono } = ROL[rol]
  return <Badge tono={tono}>{etiqueta}</Badge>
}
