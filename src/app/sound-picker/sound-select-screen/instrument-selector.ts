import type {
  Instrument,
  InstrumentFamily,
} from '../../../midi/instrument-data.ts'
import { InstrumentsByFamily } from '../../../midi/instruments.ts'
import { createButton } from '../../../ui/components/button.ts'
import { group } from '../../../ui/components/group.ts'
import { translate } from '../../../ui/transform/translate.ts'
import { getInstrumentColor } from './colors.ts'

export const makeInstrumentSelector = ({
  instrumentFamily,
  onInstrumentSelected,
  selectedInstrument,
}: {
  instrumentFamily: InstrumentFamily
  onInstrumentSelected: (instrument: Instrument) => void
  selectedInstrument: Instrument
}) => {
  return group(
    ...InstrumentsByFamily[instrumentFamily.name].map((instrument, i) =>
      translate(
        instrument.patch - instrumentFamily.firstPatch,
        -instrument.bank.lsb,
        createButton({
          color: getInstrumentColor(
            instrumentFamily,
            instrument,
            selectedInstrument.id === instrument.id,
          ),
          onPress: () => {
            onInstrumentSelected(instrument)
          },
        }),
      ),
    ),
  )
}
