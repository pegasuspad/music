import { WebRenderer } from './web-renderer'
import type { MidiDevice } from '../../src/midi/midi-device.ts'
import type { NovationLaunchpadMiniMk3 } from '../../src/vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { createLauncherProgram } from '../../src/app/launcher-program.ts'
import { WebMidiPiano } from './web-midi-piano.ts'
import { MidiScheduler } from '../../src/midi/sequencing.ts'
import { InputRouter } from '../../src/ui/input/input-router.ts'
import { Engine } from '../../src/engine/engine.ts'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const launchpadContainer = document.getElementById('launchpad')!
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const pianoContainer = document.getElementById('piano')!
const piano = new WebMidiPiano(pianoContainer)
const renderer = new WebRenderer(launchpadContainer)
const padEvents = renderer.padEvents

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

const launchpad = createStubLaunchpad()
const inputRouter = new InputRouter()
padEvents.on('pad-down', inputRouter.handle.bind(inputRouter))
padEvents.on('pad-up', inputRouter.handle.bind(inputRouter))

const engine = new Engine({
  input: inputRouter,
  initialProgram: await createLauncherProgram({
    launchpad,
    renderer,
    scheduler: new MidiScheduler(piano as unknown as MidiDevice),
    synthesizer: piano as unknown as MidiDevice,
  }),
  renderer,
})

await engine.start()
