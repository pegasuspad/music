import type { RgbColor } from '../color.ts'
import type { Cell, Drawable } from '../drawable.ts'

/**
 * Creates a `Drawable` which displays a filled rectangle with the given dimensions and color.
 */
export const createRectangle = ({
  color,
  width,
  height,
}: {
  color: RgbColor
  width: number
  height: number
}): Drawable<RgbColor> => ({
  draw: () => {
    const results: Cell<RgbColor>[] = []
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        results.push({
          value: color,
          x,
          y,
        })
      }
    }

    return results
  },
})
