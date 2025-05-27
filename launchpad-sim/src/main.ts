import { WebRenderer } from './web-renderer'
import { createPoc } from '../../src/app/poc-program.ts'
import { loop } from '../../src/ui/loop.ts'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('launchpad')!
const renderer = new WebRenderer(container)
const events = renderer.padEvents

await loop({
  events,
  program: createPoc(),
  renderer,
})
