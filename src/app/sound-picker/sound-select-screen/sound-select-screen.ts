import {
  InstrumentFamilies,
  type Instrument,
  type InstrumentFamily,
} from '../../../midi/instrument-data.ts'
import { InstrumentsByFamily } from '../../../midi/instruments.ts'
import { group } from '../../../ui/components/group.ts'
import type { Drawable } from '../../../ui/drawable.ts'
import { translate } from '../../../ui/transform/translate.ts'
import { makeFamilySelector } from './family-selector.ts'
import { makeInstrumentSelector } from './instrument-selector.ts'

export const createSoundSelectScreen = ({
  onFamilySelected,
  onInstrumentSelected,
  selectedFamily = InstrumentFamilies[0],
  selectedInstrument,
}: {
  onFamilySelected?: (family: InstrumentFamily) => void
  onInstrumentSelected?: (instrument: Instrument) => void
  selectedFamily?: InstrumentFamily
  selectedInstrument?: Instrument
} = {}): (() => Drawable) => {
  let currentSelectedFamily = selectedFamily
  let currentSelectedInstrument =
    selectedInstrument ?? InstrumentsByFamily[currentSelectedFamily.name][0]

  const selectFamily = (family: InstrumentFamily) => {
    if (family.index !== currentSelectedFamily.index) {
      currentSelectedFamily = family
      onFamilySelected?.(family)
      selectInstrument(InstrumentsByFamily[family.name][0])
      console.log('Selected family: ', family.name)
    }
  }

  const selectInstrument = (instrument: Instrument) => {
    if (instrument.id !== currentSelectedInstrument.id) {
      onInstrumentSelected?.(instrument)
      currentSelectedInstrument = instrument
      console.log(`Selected instrument: ${instrument.name}`)
    }
  }

  return () =>
    group(
      translate(
        0,
        6,
        makeFamilySelector({
          onFamilySelected: selectFamily,
          selectedFamily: currentSelectedFamily,
        }),
      ),
      translate(
        0,
        5,
        makeInstrumentSelector({
          instrumentFamily: currentSelectedFamily,
          onInstrumentSelected: selectInstrument,
          selectedInstrument: currentSelectedInstrument,
        }),
      ),
    )
}
