import { http } from './http'
import type {
  Chofer,
  Cliente,
  DatosChofer,
  DatosCliente,
  DatosExtravio,
  DatosUsuario,
  DatosVehiculo,
  DatosViaje,
  EstadoChofer,
  EstadoDeViaje,
  EstadoMantenimientoRespuesta,
  EstadoOperativo,
  ExtravioConDetalle,
  ScopeMantenimientoCompleto,
  Usuario,
  Vehiculo,
  Viaje,
  ViajeConExtravios,
} from './tipos'

function consulta(parametros: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== '') q.set(clave, String(valor))
  }
  const texto = q.toString()
  return texto ? `?${texto}` : ''
}

export const api = {
  usuarios: {
    listar: () => http.get<Usuario[]>('/usuarios'),
    crear: (datos: DatosUsuario) => http.post<Usuario>('/usuarios', datos),
    editar: (id: number, datos: Partial<DatosUsuario>) =>
      http.patch<Usuario>(`/usuarios/${id}`, datos),
    eliminar: (id: number) => http.delete<Usuario>(`/usuarios/${id}`),
  },

  vehiculos: {
    listar: (filtro: { EstadoOperativo?: EstadoOperativo } = {}) =>
      http.get<Vehiculo[]>(`/vehiculos${consulta(filtro)}`),
    crear: (datos: DatosVehiculo) => http.post<Vehiculo>('/vehiculos', datos),
    editar: (id: number, datos: Partial<DatosVehiculo>) =>
      http.patch<Vehiculo>(`/vehiculos/${id}`, datos),
    eliminar: (id: number) => http.delete<Vehiculo>(`/vehiculos/${id}`),
  },

  choferes: {
    listar: (filtro: { EstadoChofer?: EstadoChofer } = {}) =>
      http.get<Chofer[]>(`/choferes${consulta(filtro)}`),
    crear: (datos: DatosChofer) => http.post<Chofer>('/choferes', datos),
    editar: (id: number, datos: Partial<Omit<DatosChofer, 'IdVehiculoActual'>>) =>
      http.patch<Chofer>(`/choferes/${id}`, datos),
    asignarVehiculo: (id: number, IdVehiculo: number | null) =>
      http.patch<Chofer>(`/choferes/${id}/vehiculo`, { IdVehiculo }),
    eliminar: (id: number) => http.delete<Chofer>(`/choferes/${id}`),
  },

  clientes: {
    listar: (filtro: { Telefono?: string; ApellidoYNombre?: string } = {}) =>
      http.get<Cliente[]>(`/clientes${consulta(filtro)}`),
    obtener: (id: number) => http.get<Cliente>(`/clientes/${id}`),
    crear: (datos: DatosCliente) => http.post<Cliente>('/clientes', datos),
    editar: (id: number, datos: Partial<DatosCliente>) =>
      http.patch<Cliente>(`/clientes/${id}`, datos),
    eliminar: (id: number) => http.delete<Cliente>(`/clientes/${id}`),
  },

  viajes: {
    listar: (
      filtro: {
        tipo?: 'activos' | 'historicos'
        EstadoViaje?: EstadoDeViaje
        IdChofer?: number
        IdCliente?: number
      } = {},
    ) => http.get<Viaje[]>(`/viajes${consulta(filtro)}`),
    obtener: (id: number) => http.get<ViajeConExtravios>(`/viajes/${id}`),
    crear: (datos: DatosViaje) => http.post<Viaje>('/viajes', datos),
    editar: (id: number, datos: Partial<Omit<DatosViaje, 'IdOperador'>>) =>
      http.patch<Viaje>(`/viajes/${id}`, datos),
    asignar: (id: number, datos: { IdChofer: number; IdVehiculo?: number }) =>
      http.patch<Viaje>(`/viajes/${id}/asignar`, datos),
    cambiarEstado: (id: number, EstadoViaje: EstadoDeViaje) =>
      http.patch<Viaje>(`/viajes/${id}/estado`, { EstadoViaje }),
    eliminar: (id: number) => http.delete<Viaje>(`/viajes/${id}`),
  },

  extravios: {
    listar: (filtro: { IdViaje?: number; IdCliente?: number } = {}) =>
      http.get<ExtravioConDetalle[]>(`/extravios${consulta(filtro)}`),
    crear: (datos: DatosExtravio) => http.post<ExtravioConDetalle>('/extravios', datos),
    editar: (id: number, datos: Partial<DatosExtravio>) =>
      http.patch<ExtravioConDetalle>(`/extravios/${id}`, datos),
    eliminar: (id: number) => http.delete<ExtravioConDetalle>(`/extravios/${id}`),
  },

  mantenimiento: {
    obtenerEstado: () => http.get<EstadoMantenimientoRespuesta>('/system/maintenance-status'),
    actualizarScope: (scope: string, datos: { isActive: boolean; message?: string }) =>
      http.patch<ScopeMantenimientoCompleto>(`/admin/maintenance/${scope}`, datos),
  },
}
