import { NovationLaunchpadMiniMk3 } from './vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { LaunchpadRenderer } from './vendors/novation/launchpad-mini-mk3/launchpad-renderer.ts'
import { createPoc } from './app/poc-program.ts'
import { loop } from './engine/program-loop.ts'
import { createLaunchpadEventEmitter } from './vendors/novation/launchpad-mini-mk3/launchpad-event-emitter.ts'
import { MidiDevice } from './midi/midi-device.ts'
import { logger } from './logger.ts'

const main = async (): Promise<void> => {
  const launchpad = new NovationLaunchpadMiniMk3()
  const renderer = new LaunchpadRenderer(launchpad)
  const events = createLaunchpadEventEmitter(launchpad)

  launchpad.events.on('midi-stats', ({ bytesSent, interval }) => {
    logger.info(`MIDI send: ${Math.round(bytesSent / (interval / 1000))} bps`)
  })

  // const fp30x = new MidiDevice('FP-30X MIDI Bluetooth')
  const fp30x = new MidiDevice('Roland Digital Piano')

  await loop({
    events,
    program: createPoc(fp30x),
    renderer,
  })
}

await main()
