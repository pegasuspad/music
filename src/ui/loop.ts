import type { Renderer } from './renderer.ts'
import type { PadEventEmitter } from '../devices/pad-event.ts'
import type { RgbColor } from './color.ts'
import { createCanvas } from './canvas.ts'
import { InputRouter } from './input/input-router.ts'
import { InputMap } from './input/input-map.ts'
import type { Program } from './program.ts'

export const loop = ({
  events,
  program,
  renderer,
}: {
  /**
   * Object which emits low-level 'pad' events from a device. These events will be routed to the UI components
   * created by the `Program`.  If unset, no interaction handling will be provided.
   */
  events?: PadEventEmitter

  /**
   * The `Program` to execute in this loop.
   */
  program: Program

  /**
   * Renderer which will draw our components.
   */
  renderer: Renderer<RgbColor>
}): Promise<void> => {
  const render = (inputRouter: InputRouter) => {
    const canvas = createCanvas<RgbColor>(9, 9)
    const scene = program.getRoot()

    const cells = scene.draw()
    inputRouter.setMap(InputMap.fromCells(cells, canvas.width, canvas.height))
    cells.forEach((cell) => {
      canvas.set(cell.x, cell.y, cell.value)
    })

    renderer.render(canvas)
  }

  const loopIteration = () => {
    program.tick?.()
    render(inputRouter)

    setTimeout(loopIteration, 500)
  }

  const inputRouter = new InputRouter()

  events?.on('pad-down', (event) => {
    inputRouter.handle(event)
  })

  events?.on('pad-up', (event) => {
    inputRouter.handle(event)
  })

  return new Promise((_resolve, _reject) => {
    loopIteration()
  })
}
