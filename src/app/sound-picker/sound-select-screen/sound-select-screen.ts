import {
  InstrumentFamilies,
  type Instrument,
  type InstrumentFamily,
  type InstrumentFamilyName,
} from '../../midi/gm2.ts'
import type { RgbColor } from '../../ui/color.ts'
import { createButton } from '../../ui/components/button.ts'
import { group } from '../../ui/components/group.ts'
import type { Drawable } from '../../ui/drawable.ts'
import { translate } from '../../ui/transform/translate.ts'

const InstrumentFamilyColors = {
  Piano: [96, 0, 127], // Purple — elegance, classical feel
  'Chromatic Percussion': [127, 96, 48], // Sand — reflects metal/wood tones
  Organ: [127, 64, 0], // Burnt Orange — warm, vintage
  Guitar: [0, 127, 127], // Cyan — electric, expressive
  Bass: [64, 127, 96], // Mint Green — rich, low-end
  Strings: [80, 127, 96], // Mint Green (lighter) — lush, orchestral
  Ensemble: [96, 112, 80], // Sage — blended timbres, refined
  Brass: [127, 112, 0], // Gold — bold, commanding
  Reed: [127, 127, 127], // White — breathy, natural
  Pipe: [96, 127, 127], // Cool White — airy, pure
  'Synth Lead': [127, 64, 96], // Magenta — bold, cutting edge
  'Synth Pad': [127, 48, 96], // Soft Pink — ambient, warm
  'Synth Effects': [127, 32, 64], // Raspberry — experimental, edgy
  Ethnic: [96, 64, 0], // Earthy Brown — traditional, rooted
  Percussive: [127, 96, 64], // Warm Sand — rhythmic, textured
  'Sound Effects': [64, 64, 127], // Steel Blue — abstract, cinematic
} satisfies Record<InstrumentFamilyName, RgbColor>

const makeShade = (base: RgbColor, indexOf8: number): RgbColor => {
  const factors = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]
  // const factor = 0.05 + (indexOf8 / 7) * 0.8 // range from 0.3 to 1.0
  const factor = factors[indexOf8]
  return base.map((c) => Math.round(c * factor)) as RgbColor
}

export const createSoundSelectScreen = ({
  onFamilySelected,
  onInstrumentSelected,
  selectedFamily,
  selectedInstrument,
}: {
  onFamilySelected?: (family: InstrumentFamily) => void
  onInstrumentSelected?: (instrument: Instrument) => void
  selectedFamily?: InstrumentFamily
  selectedInstrument?: Instrument
} = {}): (() => Drawable<RgbColor>) => {
  let currentSelectedFamily = selectedFamily
  let currentSelectedInstrument = selectedInstrument
  let currentSelectedVariation = 0

  const selectFamily = (family: InstrumentFamily) => {
    if (family.name !== currentSelectedFamily?.name) {
      currentSelectedFamily = family
      onFamilySelected?.(family)
      selectInstrument(family.instruments[0])
      console.log('Selected family: ', family.name)
    }
  }

  const selectInstrument = (instrument: Instrument, variation = 0) => {
    if (instrument.name !== currentSelectedInstrument?.name) {
      onInstrumentSelected?.(instrument)
      currentSelectedInstrument = instrument
      console.log(`Selected instrument: ${instrument.name}`)
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
              family.name === currentSelectedFamily?.name ?
                [0, 127, 0]
              : InstrumentFamilyColors[family.name],
            onPress: () => {
              selectFamily(family)
            },
          }),
        ),
      ),
      ...(currentSelectedFamily === undefined ?
        []
      : currentSelectedFamily.instruments.map((instrument, i) =>
          translate(
            i,
            5,
            createButton({
              color:
                currentSelectedInstrument?.name === instrument.name ?
                  [0, 127, 0]
                : makeShade(
                    InstrumentFamilyColors[
                      currentSelectedFamily?.name as keyof typeof InstrumentFamilyColors
                    ],
                    i,
                  ),
              onPress: () => {
                selectInstrument(instrument)
              },
            }),
          ),
        )),
    )
}
