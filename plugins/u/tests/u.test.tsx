import { expect, mock, test } from 'claude-code/testing'
import { linea } from '../hooks/register'

const AHORA = Date.parse('2026-11-17T17:00:00Z')

const BANDA = {
  plugin: 'u',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 3, bodyColumns: 80, scroll: { offset: 0, bodyRows: 3 }, view: {} },
} as const

const medir = {
  context: {} as never,
  changed: ['rateLimits'] as const,
  rateLimits: [
    { kind: 'five_hour', percentUsed: 12, resetsAt: '2026-11-17T19:15:30Z' },
    { kind: 'seven_day', percentUsed: 16, resetsAt: '2026-11-19T20:20:00Z' },
  ],
}

test('línea con tiempo que falta', () => {
  expect(linea(medir.rateLimits, AHORA)).toBe('🟢 88 % - 2h 15m -- 🟢 84 % - 2d 03h 20m')
})

test('ya renovado: solo el porcentaje', () => {
  expect(linea(medir.rateLimits, Date.parse('2026-11-17T20:00:00Z'))).toBe('🟢 100 % -- 🟢 84 % - 2d 00h 20m')
})

test('colores por tramo', () => {
  const l = (p: number) => linea([{ kind: 'five_hour', percentUsed: p }], AHORA)
  expect(l(40)).toBe('🟢 60 %')
  expect(l(45)).toBe('🟡 55 %')
  expect(l(65)).toBe('🟠 35 %')
  expect(l(85)).toBe('🔴 15 %')
})

test('el comando /u contesta con la línea y no va a Claude', async ($, on) => {
  mock.clock(on, { now: AHORA })
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('session.usage', () => ({ value: { startedAt: 0, context: {} as never, rateLimits: medir.rateLimits } }))
  await $.session.measure(medir as never)
  const r = await $.command.run({ command: 'u', args: '' } as never)
  expect(JSON.stringify(r)).toContain('🟢 88 % - 2h 15m')
  expect(JSON.stringify(r)).toContain('"isTextDisplayOnly":true')
})

test('franja local con tiempo que falta', async ($, on) => {
  mock.clock(on, { now: AHORA })
  on('session.measure', (_, e) => ({ changed: e.changed }))
  await $.session.measure(medir as never)
  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BANDA, surface })
    expect((await ui.find({ type: 'Text', text: /^88 %$/ }))?.text).toBe('88 %')
    expect((await ui.find({ type: 'Text', text: /^ - 2h 15m$/ }))?.text).toBe(' - 2h 15m')
    expect((await ui.find({ type: 'Text', text: /2d 03h 20m/ }))?.text).toBe(' - 2d 03h 20m')
    await ui.unmount()
  }
})
