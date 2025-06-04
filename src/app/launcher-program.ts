import type { Program } from '../engine/engine.ts'
import { createLauncher } from '../engine/launcher.ts'
import { logger } from '../logger.ts'
import type { MidiDevice } from '../midi/midi-device.ts'
import type { MidiScheduler } from '../midi/sequencing.ts'
import type { Renderer } from '../ui/renderer.ts'
import type { NovationLaunchpadMiniMk3 } from '../vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { createMusicalExerciseProgram } from './musical-exercise/musical-exercise-program.ts'
import { createSoundPickerProgram } from './sound-picker/sound-picker-program.ts'

const log = logger.child({}, { msgPrefix: '[PROGRAM] ' })

export const createLauncherProgram = ({
  launchpad,
  options = {},
  renderer,
  scheduler,
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
   * MIDI scheduler used to playback event sequences.
   */
  scheduler: MidiScheduler

  /**
   * Synthesizer capable of playing back sounds
   */
  synthesizer: MidiDevice
}): Promise<Program> => {
  return createLauncher(
    [
      () => createSoundPickerProgram(launchpad, synthesizer, options),
      () =>
        createMusicalExerciseProgram({
          device: synthesizer,
          midi: scheduler,
        }),
    ],
    {
      onProgramChanged: () => {
        log.info('Resetting renderer.')
        renderer.reset()
      },
    },
  )
}
