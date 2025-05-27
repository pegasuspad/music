import { logger } from '../../logger.ts'
import type { RgbColor } from '../color.ts'
import type { Cell, Drawable } from '../drawable.ts'
import type { PressEvent } from '../input/input-event.ts'

/**
 * Creates a `Drawable` which displays a filled rectangle with the given dimensions and color.
 */
export const createRectangle = ({
  color,
  width,
  height,
  onPress,
}: {
  color: RgbColor
  width: number
  height: number
  onPress: (event: PressEvent) => void
}): Drawable<RgbColor> => ({
  draw: () => {
    const results: Cell<RgbColor>[] = []
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        results.push({
          value: color,
          x,
          y,
          onPress,
        })
      }
    }

    return results
  },
})
