import type { RgbColor } from '../../ui/color.ts'
import { createRectangle } from '../../ui/components/rectangle.ts'
import type { Drawable } from '../../ui/drawable.ts'
import { translate } from '../../ui/transform/translate.ts'

export const createSoundSelectScreen = (): Drawable<RgbColor> =>
  translate(
    0,
    6,
    createRectangle({
      color: [0, 0, 127],
      width: 8,
      height: 2,
    }),
  )
