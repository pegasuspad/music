import type { Program } from './program.ts'

export const createLauncher = async (
  programs: (() => Program)[],
): Promise<Program> => {
  let activeProgram: Program

  const selectProgram = async (index: number) => {
    activeProgram = programs[index]()
    await activeProgram.initialize?.()
  }

  await selectProgram(0)

  return {
    getRoot: () => activeProgram.getRoot(),
    initialize: () => {
      void selectProgram(1)
    },
    onUpdate: (callback) => {
      activeProgram.onUpdate?.(callback)
    },
    tick: (elapsedSeconds) => {
      activeProgram.tick?.(elapsedSeconds)
    },
  }
}
