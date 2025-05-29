import { NovationLaunchpadMiniMk3 } from './vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { LaunchpadRenderer } from './vendors/novation/launchpad-mini-mk3/launchpad-renderer.ts'
import { createPoc } from './app/poc-program.ts'
import { loop } from './engine/program-loop.ts'
import { createLaunchpadEventEmitter } from './vendors/novation/launchpad-mini-mk3/launchpad-event-emitter.ts'
import { MidiDevice } from './midi/midi-device.ts'

const main = async (): Promise<void> => {
  const launchpad = new NovationLaunchpadMiniMk3()
  const renderer = new LaunchpadRenderer(launchpad)
  const events = createLaunchpadEventEmitter(launchpad)

  const fp30x = new MidiDevice('FP-30X MIDI Bluetooth')

  await loop({
    events,
    program: createPoc(fp30x),
    renderer,
  })
}

await main()
