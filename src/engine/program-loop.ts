import type { Renderer } from '../ui/renderer.ts'
import type { PadEventEmitter } from '../midi/pad-event.ts'
import type { RgbColor } from '../ui/color.ts'
import { createCanvas } from '../ui/canvas.ts'
import { InputRouter } from '../ui/input/input-router.ts'
import { InputMap } from '../ui/input/input-map.ts'
import type { Program } from './program.ts'
import { startLoop } from './main-loop.ts'

const normalize = (color: RgbColor): RgbColor => {
  color[0] = Math.round(color[0])
  color[1] = Math.round(color[1])
  color[2] = Math.round(color[2])
  return color
}

export const loop = async ({
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
      canvas.set(cell.x, cell.y, normalize(cell.value))
    })

    renderer.render(canvas)
  }

  const inputRouter = new InputRouter()

  events?.on('pad-down', (event) => {
    inputRouter.handle(event)
  })

  events?.on('pad-up', (event) => {
    inputRouter.handle(event)
  })

  await startLoop({
    done: () => false,
    render: () => {
      render(inputRouter)
    },
    targetFps: 20,
    update: (elapsedSeconds) => {
      inputRouter.tick(elapsedSeconds)
      program.tick?.(elapsedSeconds)
    },
  })
}
