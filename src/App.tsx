import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import { Layout } from './componentes/Layout'
import { BloqueoMantenimientoModulo } from './componentes/mantenimiento/BloqueoMantenimientoModulo'
import { PantallaMantenimientoGlobal } from './componentes/mantenimiento/PantallaMantenimientoGlobal'
import { MantenimientoProvider } from './mantenimiento/MantenimientoProvider'
import { useMantenimiento } from './mantenimiento/useMantenimiento'
import { AdminMantenimiento } from './paginas/AdminMantenimiento'
import { Choferes } from './paginas/Choferes'
import { Clientes } from './paginas/Clientes'
import { Extravios } from './paginas/Extravios'
import { Historial } from './paginas/Historial'
import { Ingresar } from './paginas/Ingresar'
import { Metricas } from './paginas/Metricas'
import { NuevoViaje } from './paginas/NuevoViaje'
import { Panel } from './paginas/Panel'
import { Usuarios } from './paginas/Usuarios'
import { Vehiculos } from './paginas/Vehiculos'
import { ViajeDetalle } from './paginas/ViajeDetalle'
import { useSesion } from './sesion/contexto'
import { SesionProvider } from './sesion/SesionProvider'

function GuardiaMantenimientoGlobal() {
  const { globalMaintenance } = useMantenimiento()
  const { usuario } = useSesion()

  const esAdmin =
    usuario?.Rol === 'Duenio' || usuario?.Rol === 'Administrador'

  if (globalMaintenance && !esAdmin) {
    return <PantallaMantenimientoGlobal />
  }

  return <Outlet />
}

function RequiereSesion() {
  const { usuario } = useSesion()
  return usuario ? <Outlet /> : <Navigate to="/ingresar" replace />
}

export default function App() {
  return (
    <SesionProvider>
      <MantenimientoProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/ingresar" element={<Ingresar />} />
            <Route element={<GuardiaMantenimientoGlobal />}>
              <Route element={<RequiereSesion />}>
                <Route element={<Layout />}>
                  <Route
                    index
                    element={
                      <BloqueoMantenimientoModulo scope="VIAJES" nombreModulo="Viajes">
                        <Panel />
                      </BloqueoMantenimientoModulo>
                    }
                  />
                  <Route
                    path="viajes/nuevo"
                    element={
                      <BloqueoMantenimientoModulo scope="VIAJES" nombreModulo="Viajes">
                        <NuevoViaje />
                      </BloqueoMantenimientoModulo>
                    }
                  />
                  <Route
                    path="viajes/historial"
                    element={
                      <BloqueoMantenimientoModulo scope="VIAJES" nombreModulo="Viajes">
                        <Historial />
                      </BloqueoMantenimientoModulo>
                    }
                  />
                  <Route
                    path="viajes/:id"
                    element={
                      <BloqueoMantenimientoModulo scope="VIAJES" nombreModulo="Viajes">
                        <ViajeDetalle />
                      </BloqueoMantenimientoModulo>
                    }
                  />
                  <Route path="metricas" element={<Metricas />} />
                  <Route
                    path="choferes"
                    element={
                      <BloqueoMantenimientoModulo scope="CHOFERES" nombreModulo="Choferes">
                        <Choferes />
                      </BloqueoMantenimientoModulo>
                    }
                  />
                  <Route
                    path="vehiculos"
                    element={
                      <BloqueoMantenimientoModulo scope="VEHICULOS" nombreModulo="Vehículos">
                        <Vehiculos />
                      </BloqueoMantenimientoModulo>
                    }
                  />
                  <Route
                    path="clientes"
                    element={
                      <BloqueoMantenimientoModulo scope="CLIENTES" nombreModulo="Clientes">
                        <Clientes />
                      </BloqueoMantenimientoModulo>
                    }
                  />
                  <Route
                    path="extravios"
                    element={
                      <BloqueoMantenimientoModulo scope="EXTRAVIOS" nombreModulo="Extravíos">
                        <Extravios />
                      </BloqueoMantenimientoModulo>
                    }
                  />
                  <Route
                    path="usuarios"
                    element={
                      <BloqueoMantenimientoModulo scope="USUARIOS" nombreModulo="Usuarios">
                        <Usuarios />
                      </BloqueoMantenimientoModulo>
                    }
                  />
                  <Route path="admin/mantenimiento" element={<AdminMantenimiento />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </MantenimientoProvider>
    </SesionProvider>
  )
}
