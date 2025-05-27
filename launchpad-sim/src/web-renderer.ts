import { type Canvas } from '../../src/ui/canvas.ts'
import { type RgbColor } from '../../src/ui/color.ts'

export class WebRenderer {
  private grid: HTMLDivElement[][] = []

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

  onPress(callback: (x: number, y: number) => void) {
    for (const row of this.grid) {
      for (const cell of row) {
        cell.onclick = () => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const x = parseInt(cell.dataset.x!)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const y = parseInt(cell.dataset.y!)
          callback(x, y)
        }
      }
    }
  }
}
