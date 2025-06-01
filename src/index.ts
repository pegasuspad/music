import { NovationLaunchpadMiniMk3 } from './vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { LaunchpadRenderer } from './vendors/novation/launchpad-mini-mk3/launchpad-renderer.ts'
import { createSoundPickerProgram } from './app/sound-picker-program.ts'
import { loop } from './engine/program-loop.ts'
import { createLaunchpadEventEmitter } from './vendors/novation/launchpad-mini-mk3/launchpad-event-emitter.ts'
import { logger } from './logger.ts'
import { MidiDevice } from './midi/midi-device.ts'
import { createLauncherProgram } from './app/launcher-program.ts'

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

  // const fp30x = new MidiDevice('FP-30X MIDI Bluetooth')
  const fp30x = new MidiDevice('Roland Digital Piano')

  fp30x.on('cc', (cc) => {
    console.log('got cc', JSON.stringify(cc, null, 2))
  })

  fp30x.on('program', (program) => {
    console.log('got program', JSON.stringify(program, null, 2))
  })

  const launcher = await createLauncherProgram({
    launchpad,
    options: {
      speakInstrumentNames: true,
    },
    renderer,
    synthesizer: fp30x,
  })

  const soundPickerProgram = createSoundPickerProgram(launchpad, fp30x)

  await loop({
    events,
    program: soundPickerProgram,
    renderer,
  })
}

await main()
