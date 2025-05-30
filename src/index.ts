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

  launchpad.events.on(
    'midi-stats',
    ({ bytesReceived, bytesSent, interval }) => {
      const rx = Math.round(bytesSent / (interval / 1000))
      const tx = Math.round(bytesReceived / (interval / 1000))
      const total = rx + tx

      logger.info(
        `[STATS] MIDI data transmitted. [total=${total} bps, tx=${tx} bps, rx=${rx} bps]`,
      )
    },
  )


  await loop({
    events,
    program: createPoc(launchpad, fp30x),
    renderer,
  })
}

await main()
