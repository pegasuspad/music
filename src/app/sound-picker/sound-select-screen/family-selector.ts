import {
  InstrumentFamilies,
  type InstrumentFamily,
} from '../../../midi/instrument-data.ts'
import { createButton } from '../../../ui/components/button.ts'
import { group } from '../../../ui/components/group.ts'
import { translate } from '../../../ui/transform/translate.ts'
import { InstrumentFamilyColors } from './colors.ts'

export const makeFamilySelector = ({
  onFamilySelected,
  selectedFamily,
}: {
  onFamilySelected: (family: InstrumentFamily) => void
  selectedFamily: InstrumentFamily
}) =>
  group(
    ...InstrumentFamilies.map((family, i) =>
      translate(
        i % 8,
        1 - Math.floor(i / 8),
        createButton({
          color:
            family.name === selectedFamily.name ?
              [0, 127, 0]
            : InstrumentFamilyColors[family.name],
          onPress: () => {
            onFamilySelected(family)
          },
        }),
      ),
    ),
  )
