import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Limite } from '../types'

const limites = atom({ plugin: 'u', key: 'limites' } as const, [] as Limite[])

const SEGMENTOS = 10
const dos = (n: number) => String(n).padStart(2, '0')

// 🟢 60 % o más · 🟡 40-55 % · 🟠 20-35 % · 🔴 menos de 20 %
export function circulo(queda: number): string {
  if (queda >= 60) return '🟢'
  if (queda >= 40) return '🟡'
  if (queda >= 20) return '🟠'
  return '🔴'
}

// Color de la batería dibujada, en tramos de 5 %: verde, amarillo, rojo.
export function colorPara(queda: number): string {
  const tramo = Math.max(0, Math.min(20, Math.floor(queda / 5)))
  return hslAHex((tramo / 20) * 120, 85, 45)
}

function hslAHex(h: number, s: number, l: number): string {
  const sat = s / 100
  const lum = l / 100
  const a = sat * Math.min(lum, 1 - lum)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = lum - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Tiempo que falta: "2h 15m" (5 horas) o "2d 03h 20m" (semana).
export function falta(resetsAt: string, ahora: number, conDias: boolean): string | null {
  const fin = Date.parse(resetsAt)
  if (Number.isNaN(fin) || fin <= ahora) return null
  const min = Math.floor((fin - ahora) / 60000)
  const m = min % 60
  const horas = Math.floor(min / 60)
  if (!conDias) return `${horas}h ${dos(m)}m`
  return `${Math.floor(horas / 24)}d ${dos(horas % 24)}h ${dos(m)}m`
}

// Lo que queda (0-100). Si ya pasó la renovación, está llena.
export function quedaDe(l: Limite | undefined, ahora: number): number | null {
  if (!l) return null
  if (l.resetsAt && Date.parse(l.resetsAt) <= ahora) return 100
  return Math.max(0, Math.min(100, Math.round(100 - l.percentUsed)))
}

const sufijo = (l: Limite | undefined, ahora: number, conDias: boolean) => {
  const t = l?.resetsAt ? falta(l.resetsAt, ahora, conDias) : null
  return t ? ` - ${t}` : ''
}

export function linea(lista: readonly Limite[], ahora: number): string | undefined {
  const parte = (kind: string, conDias: boolean) => {
    const l = lista.find(x => x.kind === kind)
    const queda = quedaDe(l, ahora)
    if (queda === null) return null
    return `${circulo(queda)} ${queda} %${sufijo(l, ahora, conDias)}`
  }
  const partes = [parte('five_hour', false), parte('seven_day', true)].filter(x => x !== null)
  return partes.length > 0 ? partes.join(' -- ') : undefined
}

const limpiar = (xs: readonly Limite[]): Limite[] =>
  xs.map(x => ({ kind: x.kind, percentUsed: x.percentUsed, resetsAt: x.resetsAt }))

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    await $.command.register({
      name: 'u',
      description: 'Cuánto te queda del límite de 5 horas y del semanal',
    })
    try {
      const u = await $.session.usage()
      if (u.rateLimits.length > 0) await update($, limites, () => limpiar(u.rateLimits))
    } catch {
      // sin datos todavía
    }
    return r
  })

  on('command.run', { command: 'u' }, async $ => {
    let lista = await read($, limites)
    try {
      const u = await $.session.usage()
      if (u.rateLimits.length > 0) lista = limpiar(u.rateLimits)
    } catch {
      // se usa lo último guardado
    }
    const texto = linea(lista, await $.clock.now())
    return {
      text: texto ?? 'Sin datos todavía: llegan después de la primera respuesta de Claude.',
      isTextDisplayOnly: true,
    }
  })

  on('session.measure', async ($, e, next) => {
    if (e.rateLimits.length > 0) await update($, limites, () => limpiar(e.rateLimits))
    return next(e)
  })

  // Franja encima de la caja de texto (solo se ve en sesiones locales).
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const lista = await read($, limites)
    const ahora = await $.clock.now()

    const bateria = (clave: string, kind: string, conDias: boolean) => {
      const l = lista.find(x => x.kind === kind)
      const queda = quedaDe(l, ahora)
      if (queda === null) {
        return (
          <Box key={clave} flexDirection="row">
            <Text mono dimColor>[{'·'.repeat(SEGMENTOS)}]▌ -- %</Text>
          </Box>
        )
      }
      const color = colorPara(queda)
      const llenos = queda === 0 ? 0 : Math.max(1, Math.round((queda / 100) * SEGMENTOS))
      return (
        <Box key={clave} flexDirection="row">
          <Text mono color={color}>[</Text>
          <Text mono color={color}>{'█'.repeat(llenos)}</Text>
          <Text mono dimColor>{'░'.repeat(SEGMENTOS - llenos)}</Text>
          <Text mono color={color}>]▌ </Text>
          <Text mono bold color={color}>{queda} %</Text>
          <Text mono>{sufijo(l, ahora, conDias)}</Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="row" flexWrap="wrap" columnGap={1}>
        {bateria('cinco', 'five_hour', false)}
        <Text mono dimColor>--</Text>
        {bateria('semana', 'seven_day', true)}
      </Box>
    )
  })
}
