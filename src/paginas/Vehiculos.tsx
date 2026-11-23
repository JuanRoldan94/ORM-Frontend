import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../api'
import type { EstadoOperativo, Vehiculo } from '../api/tipos'
import { InsigniaVehiculo } from '../componentes/Insignias'
import { Modal } from '../componentes/Modal'
import { FormularioVehiculo } from '../componentes/formularios/FormularioVehiculo'
import { Aviso, BotonConfirmar, Cargando, Chips, Encabezado, Vacio } from '../componentes/ui'
import { ESTADO_OPERATIVO } from '../dominio/estados'
import { useAccion } from '../hooks/useAccion'
import { useCarga } from '../hooks/useCarga'

type Ventana = { tipo: 'nuevo' } | { tipo: 'editar'; vehiculo: Vehiculo } | null

// RF-4: alta, baja y modificación de vehículos de la flota.
export function Vehiculos() {
  const [filtro, setFiltro] = useState<EstadoOperativo | 'todos'>('todos')
  const { datos, error, cargando, recargar } = useCarga(
    () => api.vehiculos.listar(filtro === 'todos' ? {} : { EstadoOperativo: filtro }),
    `vehiculos-${filtro}`,
  )
  const [ventana, setVentana] = useState<Ventana>(null)
  const baja = useAccion()

  return (
    <>
      <Encabezado
        titulo="Vehículos"
        subtitulo="Unidades de la flota"
        acciones={
          <button type="button" className="btn btn--primario" onClick={() => setVentana({ tipo: 'nuevo' })}>
            <Plus size={18} aria-hidden="true" />
            Nuevo vehículo
          </button>
        }
      />
      <Chips
        etiqueta="Filtrar por estado"
        valor={filtro}
        onCambiar={setFiltro}
        opciones={[
          { valor: 'todos', etiqueta: 'Todos' },
          ...(Object.keys(ESTADO_OPERATIVO) as EstadoOperativo[]).map((e) => ({
            valor: e,
            etiqueta: ESTADO_OPERATIVO[e].etiqueta,
          })),
        ]}
      />

      {(error || baja.error) && <Aviso>{error ?? baja.error}</Aviso>}
      {cargando && !datos && <Cargando />}
      {datos?.length === 0 && <Vacio titulo="No hay vehículos para mostrar" />}

      <div className="lista">
        {datos?.map((v) => (
          <article key={v.IdVehiculo} className="tarjeta ficha">
            <div className="ficha__cabecera">
              <span className="patente">{v.Patente}</span>
              <InsigniaVehiculo estado={v.EstadoOperativo} />
            </div>
            <p className="ficha__subtitulo">
              {v.Marca} {v.Modelo}
            </p>
            <div className="ficha__acciones">
              <button type="button" className="btn btn--fantasma btn--chico" onClick={() => setVentana({ tipo: 'editar', vehiculo: v })}>
                <Pencil size={16} aria-hidden="true" />
                Editar
              </button>
              <BotonConfirmar
                className="btn btn--fantasma btn--peligro-texto btn--chico"
                pregunta="¿Dar de baja?"
                onConfirmar={() => void baja.ejecutar(() => api.vehiculos.eliminar(v.IdVehiculo)).then((ok) => ok && recargar())}
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
        titulo={ventana?.tipo === 'editar' ? 'Editar vehículo' : 'Nuevo vehículo'}
        onCerrar={() => setVentana(null)}
      >
        <FormularioVehiculo
          inicial={ventana?.tipo === 'editar' ? ventana.vehiculo : undefined}
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
