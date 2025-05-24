import type { RgbColor } from '../color.ts'
import type { Drawable } from '../drawable.ts'

/**
 * Creates a `Drawable` which displays a single-cell button with the specified color.
 */
export const createButton = (color: RgbColor): Drawable => ({
  draw: (canvas) => {
    canvas.set(0, 0, color)
  },
})
