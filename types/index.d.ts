export type Progress = { app: string; level: string; next: string; wins: number }

declare module 'claude-code' {
  interface PluginState {
    'training-wheels': {
      progress: Shaped<Progress | null>
      isStarted: boolean
    }
  }
}
