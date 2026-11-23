import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, Car, Headset, MapPin, Pencil, Phone, Plus, Trash2, UserRound } from 'lucide-react'
import { api } from '../api'
import type { EstadoDeViaje, Extravio } from '../api/tipos'
import { InsigniaViaje } from '../componentes/Insignias'
import { Modal } from '../componentes/Modal'
import { PieFormulario } from '../componentes/formularios/comun'
import { FormularioAsignacion } from '../componentes/formularios/FormularioAsignacion'
import { FormularioExtravio } from '../componentes/formularios/FormularioExtravio'
import { leerCampos } from '../componentes/formularios/leerCampos'
import { Aviso, BotonConfirmar, Campo, Cargando, Encabezado } from '../componentes/ui'
import { ACCION_HACIA, esCancelacion, TRANSICIONES } from '../dominio/estados'
import { formatearFechaHora } from '../dominio/formato'
import { useAccion } from '../hooks/useAccion'
import { useCarga } from '../hooks/useCarga'

type Ventana = 'editar' | 'asignar' | 'extravio' | null

export function ViajeDetalle() {
  const id = Number(useParams().id)
  const navegar = useNavigate()
  const [params, setParams] = useSearchParams()
  const { datos: viaje, error, cargando, recargar } = useCarga(() => api.viajes.obtener(id), `viaje-${id}`)
  const accion = useAccion()
  const edicion = useAccion()
  const [elegida, setVentana] = useState<Ventana>(null)
  const [extravioEditado, setExtravioEditado] = useState<Extravio | null>(null)

  const pidioAsignar = params.get('accion') === 'asignar' && viaje?.EstadoViaje === 'Pendiente'
  const ventana: Ventana = elegida ?? (pidioAsignar ? 'asignar' : null)

  if (cargando && !viaje) return <Cargando />
  if (!viaje) {
    return (
      <Aviso
        accion={
          <Link to="/" className="btn btn--secundario btn--chico">
            Volver al panel
          </Link>
        }
      >
        {error ?? 'No se encontró el viaje'}
      </Aviso>
    )
  }

  const estado = viaje.EstadoViaje
  const pendiente = estado === 'Pendiente'
  const avances = TRANSICIONES[estado].filter((e) => !esCancelacion(e))
  const cancelaciones = TRANSICIONES[estado].filter(esCancelacion)

  const cambiarEstado = (nuevo: EstadoDeViaje) =>
    accion.ejecutar(async () => {
      await api.viajes.cambiarEstado(viaje.IdViaje, nuevo)
      recargar()
    })

  const cerrar = () => {
    setVentana(null)
    setExtravioEditado(null)
    if (params.has('accion')) setParams({}, { replace: true })
  }
  const guardado = () => {
    cerrar()
    recargar()
  }

  return (
    <>
      <Link to="/" className="volver">
        <ArrowLeft size={18} aria-hidden="true" />
        Panel
      </Link>
      <Encabezado
        titulo={`Viaje #${viaje.IdViaje}`}
        subtitulo={<>Registrado el {formatearFechaHora(viaje.CreadoEl)} por {viaje.Operador.Nombre}</>}
        acciones={<InsigniaViaje estado={estado} />}
      />

      {accion.error && <Aviso>{accion.error}</Aviso>}

      <div className="detalle">
        <div className="detalle__principal">
          <section className="tarjeta">
            <div className="tarjeta__cabecera">
              <h2 className="seccion__titulo">Recorrido</h2>
              {pendiente && (
                <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setVentana('editar')}>
                  <Pencil size={16} aria-hidden="true" />
                  Editar
                </button>
              )}
            </div>
            <ol className="recorrido">
              <li>
                <MapPin size={18} aria-hidden="true" className="recorrido__icono recorrido__icono--origen" />
                <div>
                  <span className="dato__etiqueta">Origen</span>
                  {viaje.DireccionOrigen}
                </div>
              </li>
              <li>
                <MapPin size={18} aria-hidden="true" className="recorrido__icono recorrido__icono--destino" />
                <div>
                  <span className="dato__etiqueta">Destino</span>
                  {viaje.DireccionDestino}
                </div>
              </li>
            </ol>
            {viaje.Observaciones && <p className="observaciones">{viaje.Observaciones}</p>}
          </section>

          <section className="tarjeta datos">
            <div className="dato">
              <UserRound size={18} aria-hidden="true" />
              <div>
                <span className="dato__etiqueta">Cliente</span>
                {viaje.Cliente.ApellidoYNombre}
                <a href={`tel:${viaje.Cliente.Telefono}`} className="dato__enlace">
                  <Phone size={14} aria-hidden="true" />
                  {viaje.Cliente.Telefono}
                </a>
              </div>
            </div>
            <div className="dato">
              <Headset size={18} aria-hidden="true" />
              <div>
                <span className="dato__etiqueta">Chofer</span>
                {viaje.Chofer ? (
                  <>
                    {viaje.Chofer.Nombre} {viaje.Chofer.Apellido}
                    <a href={`tel:${viaje.Chofer.Telefono}`} className="dato__enlace">
                      <Phone size={14} aria-hidden="true" />
                      {viaje.Chofer.Telefono}
                    </a>
                  </>
                ) : (
                  <span className="texto-suave">Sin asignar</span>
                )}
              </div>
            </div>
            <div className="dato">
              <Car size={18} aria-hidden="true" />
              <div>
                <span className="dato__etiqueta">Vehículo</span>
                {viaje.Vehiculo ? (
                  `${viaje.Vehiculo.Patente} · ${viaje.Vehiculo.Marca} ${viaje.Vehiculo.Modelo}`
                ) : (
                  <span className="texto-suave">Sin asignar</span>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="detalle__lateral">
          {(pendiente || avances.length > 0 || cancelaciones.length > 0) && (
            <section className="tarjeta acciones-viaje">
              <h2 className="seccion__titulo">Acciones</h2>
              {pendiente && (
                <button type="button" className="btn btn--primario btn--ancho" onClick={() => setVentana('asignar')}>
                  {viaje.Chofer ? 'Reasignar chofer' : 'Asignar chofer'}
                </button>
              )}
              {avances.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="btn btn--primario btn--ancho"
                  disabled={accion.ocupado}
                  onClick={() => void cambiarEstado(e)}
                >
                  {ACCION_HACIA[e]}
                </button>
              ))}
              {cancelaciones.map((e) => (
                <BotonConfirmar
                  key={e}
                  pregunta="¿Cancelar el viaje?"
                  className="btn btn--peligro-suave btn--ancho"
                  disabled={accion.ocupado}
                  onConfirmar={() => void cambiarEstado(e)}
                >
                  {ACCION_HACIA[e]}
                </BotonConfirmar>
              ))}
            </section>
          )}

          <section className="tarjeta">
            <div className="tarjeta__cabecera">
              <h2 className="seccion__titulo">Extravíos</h2>
              <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setVentana('extravio')}>
                <Plus size={16} aria-hidden="true" />
                Registrar
              </button>
            </div>
            {viaje.Extravios.length === 0 ? (
              <p className="texto-suave">No se reportaron objetos olvidados.</p>
            ) : (
              <ul className="lista-simple">
                {viaje.Extravios.map((ex) => (
                  <li key={ex.IdExtravio} className="extravio">
                    <p>{ex.Descripcion}</p>
                    <button
                      type="button"
                      className="btn-icono"
                      aria-label="Editar extravío"
                      onClick={() => {
                        setExtravioEditado(ex)
                        setVentana('extravio')
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {estado !== 'ViajeFinalizado' && (
            <BotonConfirmar
              pregunta="¿Eliminar el viaje?"
              className="btn btn--fantasma btn--peligro-texto btn--ancho"
              onConfirmar={() =>
                void accion.ejecutar(async () => {
                  await api.viajes.eliminar(viaje.IdViaje)
                  navegar('/', { replace: true })
                })
              }
            >
              <Trash2 size={18} aria-hidden="true" />
              Eliminar viaje
            </BotonConfirmar>
          )}
        </div>
      </div>

      <Modal abierto={ventana === 'editar'} titulo="Editar viaje" onCerrar={cerrar}>
        <form
          className="formulario"
          onSubmit={(e) => {
            const campo = leerCampos(e)
            void edicion
              .ejecutar(() =>
                api.viajes.editar(viaje.IdViaje, {
                  DireccionOrigen: campo('DireccionOrigen'),
                  DireccionDestino: campo('DireccionDestino'),
                  Observaciones: campo('Observaciones'),
                }),
              )
              .then((ok) => ok && guardado())
          }}
        >
          <Campo etiqueta="Dirección de origen">
            <input name="DireccionOrigen" required maxLength={191} defaultValue={viaje.DireccionOrigen} />
          </Campo>
          <Campo etiqueta="Dirección de destino">
            <input name="DireccionDestino" required maxLength={191} defaultValue={viaje.DireccionDestino} />
          </Campo>
          <Campo etiqueta="Observaciones">
            <textarea name="Observaciones" rows={3} maxLength={5000} defaultValue={viaje.Observaciones ?? ''} />
          </Campo>
          <PieFormulario ocupado={edicion.ocupado} error={edicion.error} onCancelar={cerrar} />
        </form>
      </Modal>

      <Modal abierto={ventana === 'asignar'} titulo="Asignar chofer" onCerrar={cerrar}>
        <FormularioAsignacion viaje={viaje} onGuardado={guardado} onCancelar={cerrar} />
      </Modal>

      <Modal
        abierto={ventana === 'extravio'}
        titulo={extravioEditado ? 'Editar extravío' : 'Registrar extravío'}
        onCerrar={cerrar}
      >
        <FormularioExtravio
          viaje={{ IdViaje: viaje.IdViaje, IdCliente: viaje.IdCliente }}
          inicial={extravioEditado ?? undefined}
          onGuardado={guardado}
          onCancelar={cerrar}
        />
      </Modal>
    </>
  )
}
