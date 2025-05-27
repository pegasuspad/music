import { createCanvas, type Canvas } from '../../../ui/canvas.ts'
import type { RgbColor } from '../../../ui/color.ts'
import type { Renderer } from '../../../ui/renderer.ts'
import type { PadLighting } from './commands/set-led-lighting.ts'
import type { LightingOptions } from './model.ts'
import type { NovationLaunchpadMiniMk3 } from './novation-launchpad-mini-mk3.ts'

export const LaunchpadPadWidth = 9
export const LaunchpadPadHeight = 9

/**
 * Creates a `PadLighting` value which turns off the LED of the pad at the given position.
 */
const turnPadOff = (x: number, y: number): PadLighting => ({
  x,
  y,
  lighting: {
    color: 0,
    type: 'static',
  },
})

/**
 * Renderer which displays an `RgbColor` `Canvas` by illuminating the LEDs on a Novation Launchpad Mini MK3.
 */
export class LaunchpadRenderer implements Renderer<RgbColor> {
  private lastCanvas: Canvas<RgbColor> = createCanvas<RgbColor>(
    LaunchpadPadWidth,
    LaunchpadPadHeight,
  )

  public constructor(private launchpad: NovationLaunchpadMiniMk3) {}

  public render(canvas: Canvas<RgbColor>) {
    const diff = canvas.getData().diff(this.lastCanvas.getData())
    const padSettings = diff.map((x, y, color) => {
      return color === null ?
          turnPadOff(x, y)
        : {
            x,
            y,
            lighting: {
              type: 'static',
              color,
            } satisfies LightingOptions,
          }
    })

    void this.launchpad.sendCommand('set-led-lighting', {
      pads: padSettings,
    })

    this.lastCanvas = canvas
  }
}
