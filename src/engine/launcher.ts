import { createButton } from '../ui/components/button.ts'
import { translate } from '../ui/transform/translate.ts'
import { group } from '../ui/components/group.ts'
import { createRectangle } from '../ui/components/rectangle.ts'
import type { Program } from './engine.ts'

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
  let activeProgramIndex: number
  let activeProgram: Program | undefined

  const selectProgram = async (index: number) => {
    if (index !== activeProgramIndex) {
      await activeProgram?.shutdown?.()

      activeProgramIndex = index
      activeProgram = programs[index]()
      await activeProgram.initialize?.()
      onProgramChanged?.(activeProgram)
    }
  }

  const createLauncherUi = () => {
    const createProgramChangeButton = (direction: 1 | -1) =>
      createButton({
        color: [127, 127, 127],
        onPress: () => {
          const newIndex =
            (activeProgramIndex + direction + programs.length) % programs.length
          void selectProgram(newIndex)
        },
      })

    return group(
      translate(0, 8, createProgramChangeButton(-1)),
      translate(1, 8, createProgramChangeButton(1)),
    )
  }

  await selectProgram(0)

  const launcherUi = createLauncherUi()
  const clearPad = createRectangle({
    color: [0, 0, 0],
    height: 9,
    width: 9,
  })

  return {
    getDrawable: () =>
      activeProgram === undefined ?
        group(clearPad, launcherUi)
      : group(clearPad, activeProgram.getDrawable(), launcherUi),
    update: (elapsedSeconds) => {
      activeProgram?.update?.(elapsedSeconds)
    },
  }
}
