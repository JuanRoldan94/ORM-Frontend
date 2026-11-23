import type {
  EstadoChofer,
  EstadoDeViaje,
  EstadoOperativo,
  Rol,
} from '../api/tipos'

// Tonos de la paleta para las etiquetas (ver .badge--* en index.css).
export type Tono = 'lila' | 'indigo' | 'verde-claro' | 'verde' | 'exito' | 'oxido'

export const ESTADO_VIAJE: Record<EstadoDeViaje, { etiqueta: string; tono: Tono }> = {
  Pendiente: { etiqueta: 'Pendiente', tono: 'lila' },
  Asignado: { etiqueta: 'Asignado', tono: 'indigo' },
  ChoferEnCamino: { etiqueta: 'Chofer en camino', tono: 'verde-claro' },
  EnCurso: { etiqueta: 'En curso', tono: 'verde' },
  ViajeFinalizado: { etiqueta: 'Viaje finalizado', tono: 'exito' },
  CanceladoPorElCliente: { etiqueta: 'Cancelado por el cliente', tono: 'oxido' },
  CanceladoPorElChofer: { etiqueta: 'Cancelado por el chofer', tono: 'oxido' },
}

// Viajes activos (RF-3), en el orden del tablero.
export const ESTADOS_ACTIVOS: EstadoDeViaje[] = [
  'Pendiente',
  'Asignado',
  'ChoferEnCamino',
  'EnCurso',
]

export const ESTADOS_HISTORICOS: EstadoDeViaje[] = [
  'ViajeFinalizado',
  'CanceladoPorElCliente',
  'CanceladoPorElChofer',
]

// Mismas transiciones que el backend (sección 5.3 del documento).
// Pendiente → Asignado se hace asignando un chofer.
export const TRANSICIONES: Record<EstadoDeViaje, EstadoDeViaje[]> = {
  Pendiente: ['CanceladoPorElCliente'],
  Asignado: ['ChoferEnCamino', 'CanceladoPorElCliente', 'CanceladoPorElChofer'],
  ChoferEnCamino: ['EnCurso', 'CanceladoPorElCliente', 'CanceladoPorElChofer'],
  EnCurso: ['ViajeFinalizado', 'CanceladoPorElCliente', 'CanceladoPorElChofer'],
  ViajeFinalizado: [],
  CanceladoPorElCliente: [],
  CanceladoPorElChofer: [],
}

// Texto del botón que lleva a cada estado.
export const ACCION_HACIA: Partial<Record<EstadoDeViaje, string>> = {
  ChoferEnCamino: 'Chofer en camino',
  EnCurso: 'Iniciar viaje',
  ViajeFinalizado: 'Finalizar viaje',
  CanceladoPorElCliente: 'Canceló el cliente',
  CanceladoPorElChofer: 'Canceló el chofer',
}

export function esCancelacion(estado: EstadoDeViaje) {
  return estado === 'CanceladoPorElCliente' || estado === 'CanceladoPorElChofer'
}

// El siguiente paso "normal" del viaje (sin contar cancelaciones).
export function siguienteEstado(estado: EstadoDeViaje): EstadoDeViaje | null {
  return TRANSICIONES[estado].find((e) => !esCancelacion(e)) ?? null
}

export const ESTADO_CHOFER: Record<EstadoChofer, { etiqueta: string; tono: Tono }> = {
  Libre: { etiqueta: 'Libre', tono: 'verde-claro' },
  EnViaje: { etiqueta: 'En viaje', tono: 'lila' },
  FueraDeServicio: { etiqueta: 'Fuera de servicio', tono: 'oxido' },
  Vacaciones: { etiqueta: 'Vacaciones', tono: 'indigo' },
}

export const ESTADO_OPERATIVO: Record<EstadoOperativo, { etiqueta: string; tono: Tono }> = {
  Operativo: { etiqueta: 'Operativo', tono: 'verde-claro' },
  NoOperativo: { etiqueta: 'No operativo', tono: 'oxido' },
}

export const ROL: Record<Rol, { etiqueta: string; tono: Tono }> = {
  Duenio: { etiqueta: 'Dueño', tono: 'indigo' },
  Administrador: { etiqueta: 'Administrador', tono: 'lila' },
  Operador: { etiqueta: 'Operador', tono: 'verde-claro' },
}

// RF-1 / RNF-1: solo Administrador o Dueño gestionan usuarios.
export function puedeGestionarUsuarios(rol: Rol) {
  return rol === 'Administrador' || rol === 'Duenio'
}
