export type Limite = { kind: string; percentUsed: number; resetsAt?: string }

declare module 'claude-code' {
  interface PluginState {
    bateria: { limites: Limite[] }
  }
}
