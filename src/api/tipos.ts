export type EstadoDeViaje =
  | 'Pendiente'
  | 'Asignado'
  | 'ChoferEnCamino'
  | 'EnCurso'
  | 'ViajeFinalizado'
  | 'CanceladoPorElCliente'
  | 'CanceladoPorElChofer'

export type Rol = 'Duenio' | 'Administrador' | 'Operador'
export type EstadoOperativo = 'Operativo' | 'NoOperativo'
export type EstadoChofer = 'Libre' | 'EnViaje' | 'FueraDeServicio' | 'Vacaciones'

interface Auditoria {
  Activo: boolean
  CreadoEl: string
  UltimaModif: string
}

export interface Usuario extends Auditoria {
  IdUsuario: number
  Nombre: string
  Mail: string
  Rol: Rol
}

export interface Vehiculo extends Auditoria {
  IdVehiculo: number
  Patente: string
  Marca: string
  Modelo: string
  EstadoOperativo: EstadoOperativo
}

export interface ChoferBase extends Auditoria {
  IdChofer: number
  Nombre: string
  Apellido: string
  NumeroLicencia: string
  Telefono: string
  EstadoChofer: EstadoChofer
  IngresoTurno: string
  FinalizacionTurno: string
  IdVehiculoActual: number | null
  MaxViajes: number
  Viajes?: Array<{ IdViaje: number; EstadoViaje: EstadoDeViaje }>
}

export interface Chofer extends ChoferBase {
  VehiculoActual: Vehiculo | null
}

export interface Cliente extends Auditoria {
  IdCliente: number
  Telefono: string
  ApellidoYNombre: string
}

export interface Extravio extends Auditoria {
  IdExtravio: number
  Descripcion: string
  IdViaje: number
  IdCliente: number
}

export interface ExtravioConDetalle extends Extravio {
  Viaje: Pick<
    Viaje,
    'IdViaje' | 'DireccionOrigen' | 'DireccionDestino' | 'EstadoViaje' | 'CreadoEl'
  >
  Cliente: Cliente
}

export interface Viaje extends Auditoria {
  IdViaje: number
  DireccionOrigen: string
  DireccionDestino: string
  EstadoViaje: EstadoDeViaje
  Observaciones: string | null
  IdOperador: number
  IdCliente: number
  IdVehiculo: number | null
  IdChofer: number | null
  Operador: Pick<Usuario, 'IdUsuario' | 'Nombre' | 'Mail' | 'Rol'>
  Cliente: Cliente
  Chofer: ChoferBase | null
  Vehiculo: Vehiculo | null
}

export interface ViajeConExtravios extends Viaje {
  Extravios: Extravio[]
}

export interface DatosUsuario {
  Nombre: string
  Mail: string
  Contrasenia: string
  Rol: Rol
}

export type DatosVehiculo = Pick<
  Vehiculo,
  'Patente' | 'Marca' | 'Modelo' | 'EstadoOperativo'
>

export interface DatosChofer {
  Nombre: string
  Apellido: string
  NumeroLicencia: string
  Telefono: string
  EstadoChofer: Exclude<EstadoChofer, 'EnViaje'>
  IngresoTurno: string
  FinalizacionTurno: string
  IdVehiculoActual?: number
  MaxViajes?: number
}

export type DatosCliente = Pick<Cliente, 'Telefono' | 'ApellidoYNombre'>

export interface DatosViaje {
  DireccionOrigen: string
  DireccionDestino: string
  Observaciones?: string
  IdCliente: number
  IdOperador: number
}

export interface DatosExtravio {
  Descripcion: string
  IdViaje: number
  IdCliente: number
}
