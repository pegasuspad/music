import type { RgbColor } from '../color.ts'
import type { Drawable } from '../drawable.ts'
import { createRectangle } from './rectangle.ts'

/**
 * Creates a `Drawable` which displays a virtual fader of a specified size and color.
 */
export const createFader = ({
  length = 8,
  value,
  color = [127, 127, 127],
}: {
  /**
   * Length of the fader (i.e. the height of a vertical fader or the width of a horizontal one.)
   * @defaultValue 8
   */
  length?: number

  /**
   * Current value of the fader, in the range [0, 127].
   */
  value: number

  /**
   * Color of the fader
   * @defaultValue [127, 127, 127] (Bright white)
   */
  color?: RgbColor
}): Drawable<RgbColor> =>
  createRectangle({
    color,
    width: 1,
    height: Math.round((value / 127) * length),
  })
