import type { PaletteColor } from '../model.ts'

export interface FaderOptions {
  index: number
  type: 'bipolar' | 'unipolar'
  controlChange: number
  color: PaletteColor
}

export interface FaderBank {
  orientation: 'horizonta' | 'vertical'

  /**
   * Options for each fader. Up to 8 may be provided (to setup the entire bank.)
   */
  faders: FaderOptions[]
}
