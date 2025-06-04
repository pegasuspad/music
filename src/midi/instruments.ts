import {
  Gm2Instruments,
  type Instrument,
  InstrumentFamilies,
} from './instrument-data.ts'

// Compare function to sort by patch, then MSB, then LSB
const sortInstruments = (a: Instrument, b: Instrument) => {
  if (a.patch !== b.patch) {
    return a.patch - b.patch
  }
  if (a.bank.msb !== b.bank.msb) {
    return a.bank.msb - b.bank.msb
  }
  return a.bank.lsb - b.bank.lsb
}

/**
 * Map allowing lookup of instruments by the instrument ID.
 */
export const InstrumentsById = Gm2Instruments.reduce<
  Record<string, Instrument>
>((result, instrument) => {
  result[instrument.id] = instrument
  return result
}, {})

/**
 * Map allowing lookup of instruments by the instrument family name. Returned instruments will be sorted by patch, then
 * MSB, then LSB.
 */
export const InstrumentsByFamily = InstrumentFamilies.reduce<
  Record<string, Instrument[]>
>((result, family) => {
  result[family.name] = Gm2Instruments.filter(
    (instrument) => instrument.family === family.name,
  ).sort(sortInstruments)
  return result
}, {})

/**
 * Map allowing lookup of instrument variations by the instrument patch number. Returned instruments will be sorted by
 * the bank MSB then the bank LSB.
 */
export const InstrumentsByPatch = Array.from(
  { length: 128 },
  (_, i) => i,
).reduce<Record<number, Instrument[]>>((result, patch) => {
  result[patch] = Gm2Instruments.filter(
    (instrument) => instrument.patch === patch,
  ).sort(sortInstruments)
  return result
}, {})
