import { createLauncher } from '../engine/launcher.ts'
import type { Program } from '../engine/program.ts'
import { logger } from '../logger.ts'
import type { MidiDevice } from '../midi/midi-device.ts'
import type { Renderer } from '../ui/renderer.ts'
import type { NovationLaunchpadMiniMk3 } from '../vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { createLiveModeProgram } from './live-mode-program.ts'
import { createNoteMatchProgram } from './note-match-program.ts'
import { createSoundPickerProgram } from './sound-picker/sound-picker-program.ts'

const log = logger.child({}, { msgPrefix: '[PROGRAM] ' })

export const createLauncherProgram = ({
  launchpad,
  options = {},
  renderer,
  synthesizer,
}: {
  launchpad: NovationLaunchpadMiniMk3
  options?: {
    speakInstrumentNames?: boolean
  }

  /**
   * Renderer being used to draw program UIs.
   */
  renderer: Renderer<unknown>

  /**
   * Synthesizer capable of playing back sounds
   */
  synthesizer: MidiDevice
}): Promise<Program> => {
  return createLauncher(
    [
      () => createSoundPickerProgram(launchpad, synthesizer, options),
      () => createNoteMatchProgram(launchpad, synthesizer),
      // () => createLiveModeProgram({ launchpad }),
    ],
    {
      onProgramChanged: () => {
        log.info('Resetting renderer.')
        renderer.reset()
      },
    },
  )
}
