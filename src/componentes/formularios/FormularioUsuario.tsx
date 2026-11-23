import { api } from '../../api'
import type { DatosUsuario, Rol, Usuario } from '../../api/tipos'
import { ROL } from '../../dominio/estados'
import { useAccion } from '../../hooks/useAccion'
import { Campo } from '../ui'
import { PieFormulario } from './comun'
import { leerCampos } from './leerCampos'

export function FormularioUsuario({
  inicial,
  onGuardado,
  onCancelar,
  textoGuardar,
}: {
  inicial?: Usuario
  onGuardado: (usuario: Usuario) => void
  onCancelar?: () => void
  textoGuardar?: string
}) {
  const { ocupado, error, ejecutar } = useAccion()

  return (
    <form
      className="formulario"
      onSubmit={(e) => {
        const campo = leerCampos(e)
        const datos: DatosUsuario = {
          Nombre: campo('Nombre'),
          Mail: campo('Mail'),
          Contrasenia: campo('Contrasenia'),
          Rol: campo('Rol') as Rol,
        }
        void ejecutar(async () => {
          if (inicial) {
            // Al editar, la contraseña solo se manda si se escribió una nueva.
            const { Contrasenia, ...resto } = datos
            onGuardado(
              await api.usuarios.editar(inicial.IdUsuario, Contrasenia ? datos : resto),
            )
          } else {
            onGuardado(await api.usuarios.crear(datos))
          }
        })
      }}
    >
      <Campo etiqueta="Nombre">
        <input name="Nombre" required maxLength={191} defaultValue={inicial?.Nombre} autoComplete="name" />
      </Campo>
      <Campo etiqueta="Mail">
        <input name="Mail" type="email" required maxLength={191} defaultValue={inicial?.Mail} autoComplete="email" />
      </Campo>
      <Campo
        etiqueta="Contraseña"
        ayuda={inicial ? 'Dejala vacía para no cambiarla.' : 'Mínimo 8 caracteres.'}
      >
        <input
          name="Contrasenia"
          type="password"
          required={!inicial}
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
        />
      </Campo>
      <Campo etiqueta="Rol">
        <select name="Rol" required defaultValue={inicial?.Rol ?? 'Operador'}>
          {(Object.keys(ROL) as Rol[]).map((r) => (
            <option key={r} value={r}>
              {ROL[r].etiqueta}
            </option>
          ))}
        </select>
      </Campo>
      <PieFormulario ocupado={ocupado} error={error} onCancelar={onCancelar} textoGuardar={textoGuardar} />
    </form>
  )
}
