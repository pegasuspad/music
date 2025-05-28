import type { RgbColor } from '../color.ts'
import type { Drawable } from '../drawable.ts'
import type { PressEvent } from '../input/input-event.ts'

/**
 * Creates a `Drawable` which displays a single-cell button with the specified color.
 */
export const createButton = ({
  color = [127, 127, 127],
  onPress,
}: {
  color?: RgbColor
  onPress?: (event: PressEvent) => void
}): Drawable<RgbColor> => ({
  draw: () => [
    {
      value: color,
      x: 0,
      y: 0,
      onPress,
    },
  ],
})
