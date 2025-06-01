import { WebRenderer } from './web-renderer'
import { createSoundPickerProgram } from '../../src/app/sound-picker-program.ts'
import { loop } from '../../src/engine/program-loop.ts'
import type { MidiDevice } from '../../src/midi/midi-device.ts'
import type { NovationLaunchpadMiniMk3 } from '../../src/vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { createLauncher } from '../../src/engine/launcher.ts'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('launchpad')!
const renderer = new WebRenderer(container)
const events = renderer.padEvents

const createMockLaunchpad = () =>
  ({
    events: {
      on: (...args: unknown[]) => {},
    },
    sendCommand: (...args: unknown) => {},
  }) as unknown as NovationLaunchpadMiniMk3

const createMockMidiDevice = () =>
  ({
    on: (...args: unknown[]) => {},
    send: (...args: unknown[]) => {
      console.log(
        `Send '${args[0] as string}' with ${JSON.stringify(args[1], null, 2)}`,
      )
    },
  }) as MidiDevice

await loop({
  events,
  program: createLauncher([
    () =>
      createSoundPickerProgram(createMockLaunchpad(), createMockMidiDevice(), {
        speakInstrumentNames: false,
      }),
  ]),
  renderer,
})
