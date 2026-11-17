import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Limite } from '../types'

const limites = atom({ plugin: 'bateria', key: 'limites' } as const, [] as Limite[])

// Ecuador continental: UTC-5 todo el año (sin horario de verano).
const OFFSET_MS = -5 * 60 * 60 * 1000
const SEGMENTOS = 10

const dos = (n: number) => String(n).padStart(2, '0')

// Color en tramos de 5 %: 100 % verde, 50 % amarillo, 0 % rojo.
export function colorPara(queda: number): string {
  const tramo = Math.max(0, Math.min(20, Math.floor(queda / 5)))
  const tono = (tramo / 20) * 120
  return hslAHex(tono, 85, 45)
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

export function horaEcuador(iso: string, conFecha: boolean): string {
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return '--:--'
  const d = new Date(ms + OFFSET_MS)
  const hora = `${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}`
  return conFecha ? `${dos(d.getUTCDate())}/${dos(d.getUTCMonth() + 1)} - ${hora}` : hora
}

// Lo que queda (0-100). Si la hora de recarga ya pasó, la batería está llena.
export function quedaDe(l: Limite | undefined, ahora: number): number | null {
  if (!l) return null
  if (l.resetsAt && Date.parse(l.resetsAt) <= ahora) return 100
  return Math.max(0, Math.min(100, Math.round(100 - l.percentUsed)))
}

const limpiar = (xs: readonly Limite[]): Limite[] =>
  xs.map(x => ({ kind: x.kind, percentUsed: x.percentUsed, resetsAt: x.resetsAt }))

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    try {
      const u = await $.session.usage()
      if (u.rateLimits.length > 0) await update($, limites, () => limpiar(u.rateLimits))
    } catch {
      // sin datos todavía
    }
    return r
  })

  on('session.measure', async ($, e, next) => {
    if (e.rateLimits.length > 0) await update($, limites, () => limpiar(e.rateLimits))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const lista = await read($, limites)
    const ahora = await $.clock.now()
    const cinco = lista.find(l => l.kind === 'five_hour')
    const semana = lista.find(l => l.kind === 'seven_day')

    const bateria = (clave: string, l: Limite | undefined, conFecha: boolean) => {
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
      const yaRecargo = l?.resetsAt ? Date.parse(l.resetsAt) <= ahora : false
      const recarga = !l?.resetsAt || yaRecargo ? '' : ` - ${horaEcuador(l.resetsAt, conFecha)}`
      return (
        <Box key={clave} flexDirection="row">
          <Text mono color={color}>[</Text>
          <Text mono color={color}>{'█'.repeat(llenos)}</Text>
          <Text mono dimColor>{'░'.repeat(SEGMENTOS - llenos)}</Text>
          <Text mono color={color}>]▌ </Text>
          <Text mono bold color={color}>{queda} %</Text>
          <Text mono>{recarga}</Text>
        </Box>
      )
    }

    return (
      <Box flexDirection="row" flexWrap="wrap" columnGap={1}>
        {bateria('cinco', cinco, false)}
        <Text mono dimColor>--</Text>
        {bateria('semana', semana, true)}
      </Box>
    )
  })
}
