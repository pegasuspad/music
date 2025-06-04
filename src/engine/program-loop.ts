import type { Renderer } from '../ui/renderer.ts'
import type { RgbColor } from '../ui/color.ts'
import { createCanvas, type Canvas } from '../ui/canvas.ts'
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
  input,
  program,
  renderer,
}: {
  /**
   * Input router used to map physical interactions to the appropriate UI handlers.
   */
  input?: InputRouter

  /**
   * The `Program` to execute in this loop.
   */
  program: Program

  /**
   * Renderer which will draw our components.
   */
  renderer: Renderer<RgbColor>
}): Promise<void> => {
  const draw = (): { canvas: Canvas<RgbColor>; inputMap: InputMap } => {
    const scene = program.getRoot()
    const cells = scene.draw()

    const canvas = createCanvas<RgbColor>(9, 9)
    cells.forEach((cell) => {
      canvas.set(cell.x, cell.y, normalize(cell.value))
    })

    const inputMap = InputMap.fromCells(cells)

    return { canvas, inputMap }
  }

  const render = (canvas: Canvas<RgbColor>) => {
    renderer.render(canvas)
  }

  await program.initialize?.()

  await startLoop({
    done: () => false,
    handleInput: input?.tick.bind(input),
    render: () => {
      const { canvas, inputMap } = draw()
      input?.setMap(inputMap)
      render(canvas)
    },
    targetFps: 20,
    update: (elapsedSeconds) => {
      program.tick?.(elapsedSeconds)
    },
  })
}
