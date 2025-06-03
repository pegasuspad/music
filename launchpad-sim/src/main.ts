import { WebRenderer } from './web-renderer'
import { loop } from '../../src/engine/program-loop.ts'
import type { MidiDevice } from '../../src/midi/midi-device.ts'
import type { NovationLaunchpadMiniMk3 } from '../../src/vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { createLauncherProgram } from '../../src/app/launcher-program.ts'
import { WebMidiPiano } from './web-midi-piano.ts'
import { MidiScheduler } from '../../src/midi/sequencing.ts'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const launchpadContainer = document.getElementById('launchpad')!
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const pianoContainer = document.getElementById('piano')!
const piano = new WebMidiPiano(pianoContainer)
const renderer = new WebRenderer(launchpadContainer)
const events = renderer.padEvents

const noop = (..._args: unknown[]) => {
  // noop
}

const createStubLaunchpad = () =>
  ({
    events: {
      off: noop,
      on: noop,
    },
    sendCommand: noop,
  }) as unknown as NovationLaunchpadMiniMk3

const createStubMidiDevice = () =>
  ({
    off: noop,
    on: noop,
    send: (...args: unknown[]) => {
      console.log(
        `Send '${args[0] as string}' with ${JSON.stringify(args[1], null, 2)}`,
      )
    },
  }) as MidiDevice

await loop({
  events,
  program: await createLauncherProgram({
    launchpad: createStubLaunchpad(),
    renderer,
    scheduler: new MidiScheduler(piano as unknown as MidiDevice),
    synthesizer: piano as unknown as MidiDevice,
  }),
  renderer,
})
