import type { FormEvent } from 'react'

// Lee los campos de texto de un <form> (sin espacios en los extremos).
export function leerCampos(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const datos = new FormData(e.currentTarget)
  return (nombre: string) => String(datos.get(nombre) ?? '').trim()
}
