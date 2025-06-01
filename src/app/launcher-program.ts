import { createLauncher } from '../engine/launcher.ts'
import type { Program } from '../engine/program.ts'
import type { MidiDevice } from '../midi/midi-device.ts'
import type { NovationLaunchpadMiniMk3 } from '../vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { createLiveModeProgram } from './live-mode-program.ts'
import { createSoundPickerProgram } from './sound-picker-program.ts'

export const createLauncherProgram = ({
  launchpad,
  options = {},
  synthesizer,
}: {
  launchpad: NovationLaunchpadMiniMk3
  options?: {
    speakInstrumentNames?: boolean
  }
  synthesizer: MidiDevice
}): Promise<Program> => {
  return createLauncher([
    () => createSoundPickerProgram(launchpad, synthesizer, options),
    () => createLiveModeProgram({ launchpad }),
  ])
}
