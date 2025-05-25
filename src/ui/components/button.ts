import { logger } from '../../logger.ts'
import type { RgbColor } from '../color.ts'
import type { Drawable } from '../drawable.ts'

/**
 * Creates a `Drawable` which displays a single-cell button with the specified color.
 */
export const createButton = (color: RgbColor): Drawable<RgbColor> => ({
  draw: () => [
    {
      value: color,
      x: 0,
      y: 0,
      onPress: (event) => {
        logger.info({ event }, 'got but event')
      },
    },
  ],
})
