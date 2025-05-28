import EventEmitter from 'node:events'
import type { PadEventEmitter } from '../../../devices/pad-event.ts'
import type { NovationLaunchpadMiniMk3 } from './novation-launchpad-mini-mk3.ts'

/**
 * @future - uses private launchpad field
 */
export const createLaunchpadEventEmitter = (
  launchpad: NovationLaunchpadMiniMk3,
): PadEventEmitter => {
  const emitter = new EventEmitter() as PadEventEmitter

  launchpad._input.on('noteon', (note) => {
    const y = Math.floor((note.note - 11) / 10)
    const x = note.note - 11 - y * 10

    if (note.velocity === 0) {
      emitter.emit('pad-up', {
        x,
        y,
        type: 'pad-up',
      })
    } else {
      emitter.emit('pad-down', {
        x,
        y,
        type: 'pad-down',
      })
    }
  })

  launchpad._input.on('cc', (cc) => {
    const y = Math.floor((cc.controller - 11) / 10)
    const x = cc.controller - 11 - y * 10

    if (cc.value === 0) {
      emitter.emit('pad-up', {
        x,
        y,
        type: 'pad-up',
      })
    } else {
      emitter.emit('pad-down', {
        x,
        y,
        type: 'pad-down',
      })
    }
  })

  return emitter
}
