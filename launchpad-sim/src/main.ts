import { createCanvas } from '../../src/ui/canvas.ts'
import type { RgbColor } from '../../src/ui/color.ts'
// import { InputMap } from '~/ui/input/input-map.ts'
import { WebRenderer } from './web-renderer'
import { createScene } from '../../src/create-scene.ts'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('launchpad')!
const renderer = new WebRenderer(container)

const canvas = createCanvas<RgbColor>(9, 9)
const scene = createScene(0)

const cells = scene.draw()
// inputRouter.setMap(InputMap.fromCells(cells, canvas.width, canvas.height))
cells.forEach((cell) => {
  canvas.set(cell.x, cell.y, cell.value)
})

renderer.render(canvas)

renderer.onPress((x, y) => {
  console.log('Pad pressed at', x, y)
})
