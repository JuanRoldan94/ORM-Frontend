import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import {
  BarChart3,
  Car,
  CirclePlus,
  History,
  IdCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  Plus,
  ShieldAlert,
  UserCog,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { puedeGestionarUsuarios } from '../dominio/estados'
import { iniciales } from '../dominio/formato'
import { useSesion } from '../sesion/contexto'
import { InsigniaRol } from './Insignias'
import { Modal } from './Modal'

interface ItemNav {
  a: string
  etiqueta: string
  icono: LucideIcon
  soloAdmin?: boolean
}

const PRINCIPALES: ItemNav[] = [
  { a: '/', etiqueta: 'Panel', icono: LayoutDashboard },
  { a: '/viajes/nuevo', etiqueta: 'Nuevo viaje', icono: CirclePlus },
  { a: '/viajes/historial', etiqueta: 'Historial', icono: History },
  { a: '/choferes', etiqueta: 'Choferes', icono: IdCard },
]

const SECUNDARIOS: ItemNav[] = [
  { a: '/metricas', etiqueta: 'Métricas', icono: BarChart3 },
  { a: '/vehiculos', etiqueta: 'Vehículos', icono: Car },
  { a: '/clientes', etiqueta: 'Clientes', icono: Users },
  { a: '/extravios', etiqueta: 'Extravíos', icono: PackageSearch },
  { a: '/usuarios', etiqueta: 'Usuarios', icono: UserCog, soloAdmin: true },
  { a: '/admin/mantenimiento', etiqueta: 'Mantenimiento', icono: ShieldAlert, soloAdmin: true },
]

function Marca() {
  return (
    <Link to="/" className="marca">
      <span className="marca__logo">ORM</span>
      <span className="marca__texto">Remisería</span>
    </Link>
  )
}

export function Layout() {
  const { usuario, salir } = useSesion()
  const navegar = useNavigate()
  const [masAbierto, setMasAbierto] = useState(false)

  if (!usuario) return null
  const visibles = (items: ItemNav[]) =>
    items.filter((i) => !i.soloAdmin || puedeGestionarUsuarios(usuario.Rol))

  const cambiarUsuario = () => {
    setMasAbierto(false)
    salir()
    navegar('/ingresar')
  }

  const tarjetaUsuario = (
    <div className="usuario-actual">
      <span className="avatar">{iniciales(usuario.Nombre)}</span>
      <div className="usuario-actual__datos">
        <strong>{usuario.Nombre}</strong>
        <InsigniaRol rol={usuario.Rol} />
      </div>
    </div>
  )

  return (
    <div className="app">
      <aside className="barra-lateral">
        <Marca />
        <nav className="barra-lateral__nav" aria-label="Principal">
          {visibles([...PRINCIPALES, ...SECUNDARIOS]).map(({ a, etiqueta, icono: Icono }) => (
            <NavLink key={a} to={a} end className="barra-lateral__link">
              <Icono size={20} aria-hidden="true" />
              {etiqueta}
            </NavLink>
          ))}
        </nav>
        <div className="barra-lateral__pie">
          {tarjetaUsuario}
          <button type="button" className="btn btn--fantasma btn--ancho" onClick={cambiarUsuario}>
            <LogOut size={18} aria-hidden="true" />
            Cambiar de usuario
          </button>
        </div>
      </aside>

      <header className="barra-superior">
        <Marca />
        <button
          type="button"
          className="avatar avatar--boton"
          onClick={() => setMasAbierto(true)}
          aria-label={`Usuario: ${usuario.Nombre}`}
        >
          {iniciales(usuario.Nombre)}
        </button>
      </header>

      <main className="contenido">
        <Outlet />
      </main>

      <nav className="nav-inferior" aria-label="Principal">
        <NavLink to="/" end className="nav-inferior__item">
          <LayoutDashboard size={22} aria-hidden="true" />
          Panel
        </NavLink>
        <NavLink to="/viajes/historial" className="nav-inferior__item">
          <History size={22} aria-hidden="true" />
          Historial
        </NavLink>
        <NavLink to="/viajes/nuevo" className="nav-inferior__item nav-inferior__fab" aria-label="Nuevo viaje">
          <span>
            <Plus size={26} aria-hidden="true" />
          </span>
        </NavLink>
        <NavLink to="/choferes" className="nav-inferior__item">
          <IdCard size={22} aria-hidden="true" />
          Choferes
        </NavLink>
        <button type="button" className="nav-inferior__item" onClick={() => setMasAbierto(true)}>
          <Menu size={22} aria-hidden="true" />
          Más
        </button>
      </nav>

      <Modal abierto={masAbierto} titulo="Más opciones" onCerrar={() => setMasAbierto(false)}>
        <nav className="menu-mas" aria-label="Más opciones">
          {visibles(SECUNDARIOS).map(({ a, etiqueta, icono: Icono }) => (
            <NavLink key={a} to={a} className="menu-mas__link" onClick={() => setMasAbierto(false)}>
              <Icono size={22} aria-hidden="true" />
              {etiqueta}
            </NavLink>
          ))}
        </nav>
        {tarjetaUsuario}
        <button type="button" className="btn btn--secundario btn--ancho" onClick={cambiarUsuario}>
          <LogOut size={18} aria-hidden="true" />
          Cambiar de usuario
        </button>
      </Modal>
    </div>
  )
}
