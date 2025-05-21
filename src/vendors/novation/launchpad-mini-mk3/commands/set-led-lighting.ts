import type { PaletteColor, RgbColor } from '../model.ts'
import type { LaunchpadCommandWithoutReadback } from './common.ts'

export interface BaseLightingOptions {
  /**
   * Type of lighting to enable for this pad:
   *
   *   - flashing: alternates between two colors in time with the MIDI clock
   *   - pulsing: transition between a high- and low-intensity version of a color in time with the MIDI clock
   *   - static: display a solid color
   *
   * See the programmer reference for details on the duty cycle for flashing and pulsing modes.
   */
  type: 'flashing' | 'pulsing' | 'static'

  /**
   * The color to use for this pad. If type is 'static', the LED will light with this color. If the type is
   * 'pulsing' it will transition between low- and high- intensity versions of this color. The pulsing color must be
   * specified as a `PaletteColor`, but a static pad can use either a `PaletteColor` or an `RgbColor`.
   */
  color?: PaletteColor | RgbColor | undefined

  /**
   * Two colors to alternate between when the lighting type is "flashing".
   */
  colors?: [PaletteColor, PaletteColor] | undefined
}

export interface FlashingLighting extends BaseLightingOptions {
  type: 'flashing'
  color?: undefined
  colors: [PaletteColor, PaletteColor]
}

export interface PulsingLighting extends BaseLightingOptions {
  type: 'pulsing'
  color: PaletteColor
  colors?: undefined
}

export interface StaticLighting extends BaseLightingOptions {
  type: 'static'
  color: PaletteColor | RgbColor
  colors?: undefined
}

export type LightingOptions =
  | FlashingLighting
  | PulsingLighting
  | StaticLighting

const padLightingToBytes = (
  x: number,
  y: number,
  data: LightingOptions,
): number[] => {
  const TYPE_PALETTE = 0x00
  const TYPE_FLASHING = 0x01
  const TYPE_PULSING = 0x02
  const TYPE_RGB = 0x03

  const ledIndex = 11 + 10 * y + x

  switch (data.type) {
    case 'flashing':
      return [TYPE_FLASHING, ledIndex, ...data.colors]
    case 'pulsing':
      return [TYPE_PULSING, ledIndex, data.color]
    case 'static':
      if (Array.isArray(data.color)) {
        return [TYPE_RGB, ledIndex, ...data.color]
      } else {
        return [TYPE_PALETTE, ledIndex, data.color]
      }
  }
}

export interface GridLighting {
  /**
   * Lighting configuration for all pads in the grid. Expects a 9x9 array with each entry representing a pad. The first
   * index is the Y-coordinate (0 == bottom, 8 == top) and the second is the X-coordinate (0 == left, 8 == right).
   */
  pads: LightingOptions[][]
}

export const SetLedLightingCommand: LaunchpadCommandWithoutReadback<GridLighting> =
  {
    code: 0x03,
    name: 'set-led-lighting',
    toBytes: (data) =>
      data.pads.flatMap((row, y) =>
        row.flatMap((pad, x) => padLightingToBytes(x, y, pad)),
      ),
    readback: false,
  }
