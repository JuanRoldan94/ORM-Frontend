const fechaHora = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

const hora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export function formatearFechaHora(iso: string) {
  return fechaHora.format(new Date(iso))
}

export function formatearHora(iso: string) {
  return hora.format(new Date(iso))
}

export function haceCuanto(iso: string, ahora = Date.now()) {
  const minutos = Math.floor((ahora - new Date(iso).getTime()) / 60000)
  if (minutos < 1) return 'recién'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  return formatearFechaHora(iso)
}

// <input type="datetime-local"> trabaja con hora local sin zona: "2026-10-21T08:00".
export function aInputFechaHora(iso: string) {
  const d = new Date(iso)
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`
}

export function deInputFechaHora(valor: string) {
  return new Date(valor).toISOString()
}

export function iniciales(texto: string) {
  return texto
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
