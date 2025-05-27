import { type Canvas } from '../../src/ui/canvas.ts'
import { type RgbColor } from '../../src/ui/color.ts'
import {
  type PadEventEmitter,
  type PadEventMap,
} from '../../src/devices/pad-event.ts'
import { Events } from '../../src/typed-event-emitter.ts'

export class WebRenderer {
  private grid: HTMLDivElement[][] = []
  private _padEvents: PadEventEmitter = new Events<PadEventMap>()

  constructor(container: HTMLElement) {
    container.style.display = 'grid'
    container.style.gridTemplateColumns = 'repeat(9, 1fr)'
    container.style.width = '360px'
    container.style.height = '360px'
    container.style.gap = '2px'

    for (let y = 8; y >= 0; y--) {
      this.grid[y] = []
      for (let x = 0; x < 9; x++) {
        const cell = document.createElement('div')
        cell.style.width = '100%'
        cell.style.aspectRatio = '1'
        cell.style.backgroundColor = 'black'
        cell.dataset.x = x.toString()
        cell.dataset.y = y.toString()
        container.appendChild(cell)

        cell.onmousedown = () => {
          console.log('cellds', cell.dataset)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const x = parseInt(cell.dataset.x!)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const y = parseInt(cell.dataset.y!)
          this._padEvents.emit('pad-down', {
            type: 'pad-down',
            x,
            y,
          })
        }

        cell.onmouseup = () => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const x = parseInt(cell.dataset.x!)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const y = parseInt(cell.dataset.y!)
          this._padEvents.emit('pad-up', {
            type: 'pad-up',
            x,
            y,
          })
        }

        this.grid[y][x] = cell
      }
    }
  }

  render(canvas: Canvas<RgbColor>) {
    const grid = canvas.getData()

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const [r, g, b] = grid.get(x, y) ?? [0, 0, 0]
        const color = `rgb(${r * 2}, ${g * 2}, ${b * 2})`
        this.grid[y][x].style.backgroundColor = color
      }
    }
  }

  public get padEvents(): PadEventEmitter {
    return this._padEvents
  }
}
