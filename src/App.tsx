import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import { Layout } from './componentes/Layout'
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

function RequiereSesion() {
  const { usuario } = useSesion()
  return usuario ? <Outlet /> : <Navigate to="/ingresar" replace />
}

export default function App() {
  return (
    <SesionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/ingresar" element={<Ingresar />} />
          <Route element={<RequiereSesion />}>
            <Route element={<Layout />}>
              <Route index element={<Panel />} />
              <Route path="viajes/nuevo" element={<NuevoViaje />} />
              <Route path="viajes/historial" element={<Historial />} />
              <Route path="viajes/:id" element={<ViajeDetalle />} />
              <Route path="metricas" element={<Metricas />} />
              <Route path="choferes" element={<Choferes />} />
              <Route path="vehiculos" element={<Vehiculos />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="extravios" element={<Extravios />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </SesionProvider>
  )
}
