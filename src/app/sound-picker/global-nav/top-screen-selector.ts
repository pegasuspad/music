import type { RgbColor } from '../../ui/color.ts'
import { createButton } from '../../ui/components/button.ts'
import { group } from '../../ui/components/group.ts'
import type { Drawable } from '../../ui/drawable.ts'
import { translate } from '../../ui/transform/translate.ts'

export const createTopScreenSelector = ({
  numberOfScreens = 1,
  onScreenSelected,
  selectedScreenId = 0,
}: {
  numberOfScreens?: number
  onScreenSelected: (selectedScreenId: number) => void
  selectedScreenId?: number
}): Drawable<RgbColor> =>
  group(
    ...Array.from({ length: numberOfScreens }, (_, i) =>
      translate(
        4 + i,
        8,
        createButton({
          color: selectedScreenId === i ? [64, 127, 64] : [32, 32, 32],
          onPress: () => {
            onScreenSelected(i)
          },
        }),
      ),
    ),
  )
