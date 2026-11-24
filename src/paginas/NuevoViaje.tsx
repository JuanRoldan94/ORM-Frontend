import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Phone, Search, UserPlus, X } from 'lucide-react'
import { api } from '../api'
import type { Cliente } from '../api/tipos'
import { PieFormulario } from '../componentes/formularios/comun'
import { leerCampos } from '../componentes/formularios/leerCampos'
import { Campo, Encabezado } from '../componentes/ui'
import { useAccion } from '../hooks/useAccion'
import { useCarga } from '../hooks/useCarga'
import { useDemorado } from '../hooks/useDemorado'
import { useSesion } from '../sesion/contexto'

// Si tiene letras se busca por nombre; si no, por teléfono.
function filtroDeBusqueda(texto: string) {
  return /[a-záéíóúñ]/i.test(texto) ? { ApellidoYNombre: texto } : { Telefono: texto }
}

export function NuevoViaje() {
  const { usuario } = useSesion()
  const navegar = useNavigate()
  const [params] = useSearchParams()
  const idClienteInicial = Number(params.get('cliente')) || null

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [usarPreseleccionado, setUsarPreseleccionado] = useState(true)
  const [clienteNuevo, setClienteNuevo] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const termino = useDemorado(busqueda.trim())
  const { ocupado, error, ejecutar } = useAccion()

  // Viene desde "Nuevo viaje" de la pantalla de clientes.
  const preseleccionado = useCarga(
    () => (idClienteInicial ? api.clientes.obtener(idClienteInicial) : Promise.resolve(null)),
    `cliente-${idClienteInicial}`,
  )
  const clienteElegido = cliente ?? (usarPreseleccionado ? preseleccionado.datos : null)

  const resultados = useCarga(
    () => (termino.length >= 3 ? api.clientes.listar(filtroDeBusqueda(termino)) : Promise.resolve([])),
    `buscar-${termino}`,
  )

  if (!usuario) return null

  return (
    <>
      <Encabezado titulo="Nuevo viaje" subtitulo="Registrá la llamada del cliente" />
      <form
        className="formulario nuevo-viaje"
        onSubmit={(e) => {
          const campo = leerCampos(e)
          void ejecutar(async () => {
            let idCliente = clienteElegido?.IdCliente
            if (!idCliente) {
              if (!clienteNuevo) throw new Error('Elegí un cliente o cargá uno nuevo')
              const telefonoNuevo = campo('Telefono').trim()
              if (!/^\+?[0-9\s\-()]{6,20}$/.test(telefonoNuevo)) {
                throw new Error('El teléfono del nuevo cliente debe tener entre 6 y 20 caracteres numéricos')
              }
              const creado = await api.clientes.crear({
                ApellidoYNombre: campo('ApellidoYNombre'),
                Telefono: telefonoNuevo,
              })
              idCliente = creado.IdCliente
            }
            const viaje = await api.viajes.crear({
              DireccionOrigen: campo('DireccionOrigen'),
              DireccionDestino: campo('DireccionDestino'),
              Observaciones: campo('Observaciones') || undefined,
              IdCliente: idCliente,
              IdOperador: usuario.IdUsuario,
            })
            navegar(`/viajes/${viaje.IdViaje}`)
          })
        }}
      >
        <section className="tarjeta nuevo-viaje__seccion">
          <h2 className="seccion__titulo">1. Cliente</h2>

          {clienteElegido && (
            <div className="cliente-elegido">
              <div>
                <strong>{clienteElegido.ApellidoYNombre}</strong>
                <span>
                  <Phone size={14} aria-hidden="true" />
                  {clienteElegido.Telefono}
                </span>
              </div>
              <button
                type="button"
                className="btn-icono"
                aria-label="Cambiar cliente"
                onClick={() => {
                  setCliente(null)
                  setUsarPreseleccionado(false)
                  setBusqueda('')
                }}
              >
                <X size={18} />
              </button>
            </div>
          )}

          {!clienteElegido && !clienteNuevo && (
            <>
              <Campo etiqueta="Buscar por teléfono o nombre" ayuda="Escribí al menos 3 caracteres.">
                <span className="input-con-icono">
                  <Search size={18} aria-hidden="true" />
                  <input
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="341 666…"
                    autoFocus
                  />
                </span>
              </Campo>
              {termino.length >= 3 && resultados.datos && (
                <ul className="lista-simple">
                  {resultados.datos.map((c) => (
                    <li key={c.IdCliente}>
                      <button type="button" className="fila-boton" onClick={() => setCliente(c)}>
                        <span className="fila-boton__texto">
                          <strong>{c.ApellidoYNombre}</strong>
                          <span>{c.Telefono}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                  {resultados.datos.length === 0 && (
                    <li className="lista-simple__vacio">No hay clientes que coincidan.</li>
                  )}
                </ul>
              )}
              <button type="button" className="btn btn--secundario" onClick={() => setClienteNuevo(true)}>
                <UserPlus size={18} aria-hidden="true" />
                Cliente nuevo
              </button>
            </>
          )}

          {!clienteElegido && clienteNuevo && (
            <>
              <div className="formulario__fila">
                <Campo etiqueta="Apellido y nombre">
                  <input name="ApellidoYNombre" required maxLength={191} placeholder="García, María" />
                </Campo>
                <Campo etiqueta="Teléfono" ayuda="Ej: 341 555-1234">
                  <input
                    name="Telefono"
                    type="tel"
                    required
                    pattern="^\+?[0-9\s\-()]{6,20}$"
                    title="Entre 6 y 20 caracteres numéricos"
                    maxLength={191}
                    defaultValue={/[a-z]/i.test(busqueda) ? '' : busqueda}
                  />
                </Campo>
              </div>
              <button type="button" className="btn btn--fantasma" onClick={() => setClienteNuevo(false)}>
                Buscar un cliente existente
              </button>
            </>
          )}
        </section>

        <section className="tarjeta nuevo-viaje__seccion">
          <h2 className="seccion__titulo">2. Recorrido</h2>
          <Campo etiqueta="Dirección de origen">
            <input name="DireccionOrigen" required maxLength={191} placeholder="Córdoba 1234" />
          </Campo>
          <Campo etiqueta="Dirección de destino">
            <input name="DireccionDestino" required maxLength={191} placeholder="Terminal de ómnibus" />
          </Campo>
          <Campo etiqueta="Observaciones (opcional)">
            <textarea name="Observaciones" rows={3} maxLength={5000} placeholder="Lleva valija, silla de ruedas…" />
          </Campo>
          <PieFormulario ocupado={ocupado} error={error} textoGuardar="Registrar viaje" />
        </section>
      </form>
    </>
  )
}
