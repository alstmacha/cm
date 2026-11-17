import { expect, mock, test } from 'claude-code/testing'

// 17/11/2026 12:00 hora de Ecuador = 17:00 UTC
const AHORA = Date.parse('2026-11-17T17:00:00Z')

const BANDA = {
  plugin: 'bateria',
  component: 'AbovePrompt',
  props: { hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 3, bodyColumns: 80, scroll: { offset: 0, bodyRows: 3 }, view: {} },
} as const

const medir = {
  context: {} as never,
  changed: ['rateLimits'] as const,
  rateLimits: [
    { kind: 'five_hour', percentUsed: 28, resetsAt: '2026-11-17T20:40:00Z' },
    { kind: 'seven_day', percentUsed: 40.5, resetsAt: '2026-11-23T14:00:00Z' },
  ],
}

test('dibuja las dos baterías con su hora de recarga en hora de Ecuador', async ($, on) => {
  mock.clock(on, { now: AHORA })
  on('session.measure', (_, e) => ({ changed: e.changed }))
  await $.session.measure(medir as never)

  for (const surface of ['terminal', 'desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BANDA, surface })
    expect((await ui.find({ type: 'Text', text: /^72 %$/ }))?.text).toBe('72 %')
    expect((await ui.find({ type: 'Text', text: /^ - 15:40$/ }))?.text).toBe(' - 15:40')
    expect((await ui.find({ type: 'Text', text: /^60 %$/ }))?.text).toBe('60 %')
    expect((await ui.find({ type: 'Text', text: /23\/11 - 09:00/ }))?.text).toBe(' - 23/11 - 09:00')
    await ui.unmount()
  }
})

test('sin datos muestra baterías vacías', async ($, on) => {
  mock.clock(on, { now: AHORA })
  const ui = await $.ui.mount({ ...BANDA, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /-- %/ }))?.text).toContain('-- %')
  await ui.unmount()
})

test('si la hora de recarga ya pasó, la batería está llena', async ($, on) => {
  mock.clock(on, { now: Date.parse('2026-11-17T21:00:00Z') })
  on('session.measure', (_, e) => ({ changed: e.changed }))
  await $.session.measure(medir as never)
  const ui = await $.ui.mount({ ...BANDA, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /^100 %$/ }))?.text).toBe('100 %')
  await ui.unmount()
})
