import type { Program } from '../engine/program.ts'

export const createLauncher = (programs: (() => Program)[]): Program => {
  const activeProgram = programs[0]()

  return {
    getRoot: () => activeProgram.getRoot(),
    onUpdate: (callback) => {
      activeProgram.onUpdate?.(callback)
    },
    tick: (elapsedSeconds) => {
      activeProgram.tick?.(elapsedSeconds)
    },
  }
}
