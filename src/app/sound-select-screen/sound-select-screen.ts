import { InstrumentFamilies, type InstrumentFamily } from '../../midi/gm2.ts'
import type { RgbColor } from '../../ui/color.ts'
import { createButton } from '../../ui/components/button.ts'
import { group } from '../../ui/components/group.ts'
import type { Drawable } from '../../ui/drawable.ts'
import { translate } from '../../ui/transform/translate.ts'

const InstrumentFamilyColors = {
  piano: [127, 0, 127],
  'chromatic percussion': [127, 0, 127],
  organ: [127, 96, 0],
  guitar: [127, 0, 127],
  bass: [127, 0, 127],
  strings: [127, 0, 127],
  ensemble: [127, 0, 127],
  brass: [127, 0, 127],
  reed: [127, 127, 127],
  pipe: [127, 0, 127],
  'synth lead': [127, 0, 127],
  'synth pad': [127, 0, 127],
  'synth effects': [127, 0, 127],
  ethnic: [127, 0, 127],
  percussive: [127, 0, 127],
  'sound effects': [127, 0, 127],
} satisfies Record<InstrumentFamily, RgbColor>

export const createSoundSelectScreen = ({
  onFamilySelected,
  selectedFamily,
}: {
  onFamilySelected?: (family: InstrumentFamily) => void
  selectedFamily?: InstrumentFamily
} = {}): (() => Drawable<RgbColor>) => {
  let currentSelectedFamily = selectedFamily

  const updateSelectedFamily = (family: InstrumentFamily) => {
    if (family !== currentSelectedFamily) {
      console.log('select family: ', family)
      currentSelectedFamily = family
      onFamilySelected?.(family)
    }
  }

  return () =>
    group(
      ...InstrumentFamilies.map((family, i) =>
        translate(
          i % 8,
          7 - Math.floor(i / 8),
          createButton({
            color:
              family.toLocaleLowerCase() === currentSelectedFamily ?
                [0, 127, 0]
              : InstrumentFamilyColors[
                  family.toLocaleLowerCase() as InstrumentFamily
                ],
            onPress: () => {
              updateSelectedFamily(
                family.toLocaleLowerCase() as InstrumentFamily,
              )
            },
          }),
        ),
      ),
    )
}
