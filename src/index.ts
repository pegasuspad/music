import { NovationLaunchpadMiniMk3 } from './vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import type { Drawable } from './ui/drawable.ts'
import { group } from './ui/components/group.ts'
import { createRectangle } from './ui/components/rectangle.ts'
import { translate } from './ui/transform/translate.ts'
import { createButton } from './ui/components/button.ts'
import { createFader } from './ui/components/fader.ts'
import { LaunchpadRenderer } from './vendors/novation/launchpad-mini-mk3/lighting/launchpad-renderer.ts'
import { createCanvas } from './ui/canvas.ts'
import { RgbColor } from './ui/color.ts'
import { InputMap } from './ui/input/input-map.ts'
import { InputRouter } from './ui/input/input-router.ts'

const createScene = (x: number): Drawable<RgbColor> =>
  group(
    translate(
      3,
      1,
      createFader({
        length: 7,
        value: 98,
        color: [127, 0, 0],
      }),
    ),
    translate(
      x,
      0,
      group(
        translate(
          -1,
          2,
          createRectangle({
            color: [0, 127, 0],
            width: 3,
            height: 4,
          }),
        ),
        translate(
          0,
          0,
          createRectangle({
            width: 1,
            height: 8,
            color: [64, 0, 0],
          }),
        ),
        createButton([0, 0, 127]),
        translate(0, 7, createButton([0, 0, 127])),
      ),
    ),
  )

const main = (): Promise<void> => {
  return new Promise(() => {
    const launchpad = new NovationLaunchpadMiniMk3()
    const renderer = new LaunchpadRenderer(launchpad)
    const inputRouter = new InputRouter()

    launchpad._input.on('noteon', (note) => {
      const y = Math.floor((note.note - 11) / 10)
      const x = note.note - 11 - y * 10

      console.log('x', x, 'y', y)

      inputRouter.handle({
        x,
        y,
        type: 'pad-down',
      })
    })

    let x = 0

    const update = () => {
      x = (x + 1) % 9
    }

    const render = () => {
      const canvas = createCanvas<RgbColor>(9, 9)
      const scene = createScene(x)

      const cells = scene.draw()
      inputRouter.setMap(InputMap.fromCells(cells, canvas.width, canvas.height))
      cells.forEach((cell) => {
        canvas.set(cell.x, cell.y, cell.value)
      })

      renderer.render(canvas)
    }

    const loop = () => {
      update()
      render()

      setTimeout(loop, 500)
    }

    loop()
  })
}

await main()
