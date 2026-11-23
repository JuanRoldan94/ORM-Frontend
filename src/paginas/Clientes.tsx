import { useState } from 'react'
import { Link } from 'react-router'
import { CirclePlus, Pencil, Phone, Plus, Search, Trash2 } from 'lucide-react'
import { api } from '../api'
import type { Cliente } from '../api/tipos'
import { Modal } from '../componentes/Modal'
import { FormularioCliente } from '../componentes/formularios/FormularioCliente'
import { Aviso, BotonConfirmar, Cargando, Encabezado, Vacio } from '../componentes/ui'
import { iniciales } from '../dominio/formato'
import { useAccion } from '../hooks/useAccion'
import { useCarga } from '../hooks/useCarga'
import { useDemorado } from '../hooks/useDemorado'

type Ventana = { tipo: 'nuevo' } | { tipo: 'editar'; cliente: Cliente } | null

export function Clientes() {
  const [busqueda, setBusqueda] = useState('')
  const termino = useDemorado(busqueda.trim())
  const { datos, error, cargando, recargar } = useCarga(
    () =>
      api.clientes.listar(
        /[a-záéíóúñ]/i.test(termino) ? { ApellidoYNombre: termino } : { Telefono: termino },
      ),
    `clientes-${termino}`,
  )
  const [ventana, setVentana] = useState<Ventana>(null)
  const baja = useAccion()

  return (
    <>
      <Encabezado
        titulo="Clientes"
        acciones={
          <button type="button" className="btn btn--primario" onClick={() => setVentana({ tipo: 'nuevo' })}>
            <Plus size={18} aria-hidden="true" />
            Nuevo cliente
          </button>
        }
      />
      <div className="barra-filtros">
        <span className="input-con-icono barra-filtros__buscar">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por teléfono o nombre"
            aria-label="Buscar clientes"
          />
        </span>
      </div>

      {(error || baja.error) && <Aviso>{error ?? baja.error}</Aviso>}
      {cargando && !datos && <Cargando />}
      {datos?.length === 0 && <Vacio titulo="No hay clientes para mostrar" />}

      <div className="lista">
        {datos?.map((c) => (
          <article key={c.IdCliente} className="tarjeta ficha">
            <div className="ficha__cabecera">
              <span className="avatar avatar--grande">{iniciales(c.ApellidoYNombre)}</span>
              <div className="ficha__titulo">
                <h2>{c.ApellidoYNombre}</h2>
                <a href={`tel:${c.Telefono}`} className="dato__enlace">
                  <Phone size={14} aria-hidden="true" />
                  {c.Telefono}
                </a>
              </div>
            </div>
            <div className="ficha__acciones">
              <Link to={`/viajes/nuevo?cliente=${c.IdCliente}`} className="btn btn--secundario btn--chico">
                <CirclePlus size={16} aria-hidden="true" />
                Nuevo viaje
              </Link>
              <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setVentana({ tipo: 'editar', cliente: c })}>
                <Pencil size={16} aria-hidden="true" />
                Editar
              </button>
              <BotonConfirmar
                className="btn btn--fantasma btn--peligro-texto btn--chico"
                pregunta="¿Dar de baja?"
                onConfirmar={() => void baja.ejecutar(() => api.clientes.eliminar(c.IdCliente)).then((ok) => ok && recargar())}
              >
                <Trash2 size={16} aria-hidden="true" />
                Baja
              </BotonConfirmar>
            </div>
          </article>
        ))}
      </div>

      <Modal
        abierto={ventana !== null}
        titulo={ventana?.tipo === 'editar' ? 'Editar cliente' : 'Nuevo cliente'}
        onCerrar={() => setVentana(null)}
      >
        <FormularioCliente
          inicial={ventana?.tipo === 'editar' ? ventana.cliente : undefined}
          onGuardado={() => {
            setVentana(null)
            recargar()
          }}
          onCancelar={() => setVentana(null)}
        />
      </Modal>
    </>
  )
}
