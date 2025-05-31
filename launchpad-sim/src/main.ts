import { WebRenderer } from './web-renderer'
import { createPoc } from '../../src/app/poc-program.ts'
import { loop } from '../../src/engine/program-loop.ts'
import type { MidiDevice } from '../../src/midi/midi-device.ts'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('launchpad')!
const renderer = new WebRenderer(container)
const events = renderer.padEvents

await loop({
  events,
  program: createPoc({
    on: (...args: unknown[]) => {},
    send: (...args: unknown[]) => {
      console.log(
        `Send '${args[0] as string}' with ${JSON.stringify(args[1], null, 2)}`,
      )
    },
  } as MidiDevice),
  renderer,
})
