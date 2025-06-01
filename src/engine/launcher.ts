import type { Program } from './program.ts'

export const createLauncher = async (
  programs: (() => Program)[],
  {
    onProgramChanged,
  }: {
    /**
     * Callback invoked when the current program is changed.
     */
    onProgramChanged?: (program: Program) => void
  } = {},
): Promise<Program> => {
  let activeProgram: Program

  const selectProgram = async (index: number) => {
    activeProgram = programs[index]()
    await activeProgram.initialize?.()
    onProgramChanged?.(activeProgram)
  }

  await selectProgram(0)

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
