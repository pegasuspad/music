import type { RgbColor } from '../color.ts'
import type { Drawable } from '../drawable.ts'
import type { PressEvent } from '../input/input-event.ts'

/**
 * Creates a `Drawable` which displays a virtual fader of a specified size and color.
 */
export const createFader = ({
  length = 8,
  onChange,
  value,
  color = [127, 127, 127],
}: {
  /**
   * Length of the fader (i.e. the height of a vertical fader or the width of a horizontal one.)
   * @defaultValue 8
   */
  length?: number

  /**
   * Optional callback to invoke when the value of the fader changes.
   */
  onChange?: (value: number) => void

  /**
   * Current value of the fader, in the range [0, 127].
   */
  value: number

  /**
   * Color of the fader
   * @defaultValue [127, 127, 127] (Bright white)
   */
  color?: RgbColor
}): Drawable<RgbColor> => {
  const onPress = (event: PressEvent) => {
    const newValue = event.y * (127 / length)
    onChange?.(newValue)
  }

  const litCells = value / (127 / length)
  const offColor: RgbColor = [0, 0, 0]

  return {
    draw: () =>
      Array.from({ length }, (_, i) => ({
        onPress,
        value: i <= litCells ? color : offColor,
        x: 0,
        y: i,
      })),
  }
}
