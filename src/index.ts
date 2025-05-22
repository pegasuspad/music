import { NovationLaunchpadMiniMk3 } from './vendors/novation/launchpad-mini-mk3/novation-launchpad-mini-mk3.ts'
import { Frame } from './vendors/novation/launchpad-mini-mk3/ui/frame.ts'
import type { PadLighting } from './vendors/novation/launchpad-mini-mk3/commands/set-led-lighting.ts'
import type {
  LightingOptions,
  PaletteColor,
  RgbColor,
} from './vendors/novation/launchpad-mini-mk3/model.ts'

const drawButton = (
  frame: Frame,
  {
    x,
    y,
    lighting,
  }: {
    x: number
    y: number
    lighting: LightingOptions
  },
) => {
  frame.set(x, y, lighting)
}

const drawRectangle = (
  frame: Frame,
  {
    x,
    y,
    width,
    height,
    lighting,
  }: {
    x: number
    y: number
    width: number
    height: number
    lighting: LightingOptions
  },
) => {
  for (let currentX = x; currentX < x + width; currentX++) {
    for (let currentY = y; currentY < y + height; currentY++) {
      frame.set(currentX, currentY, lighting)
    }
  }
}

const drawFader = (
  frame: Frame,
  {
    position,
    start = 0,
    length = 8,
    value,
    color = [127, 127, 127],
  }: {
    position: number
    start?: number
    length?: number
    value: number
    color: PaletteColor | RgbColor
  },
) => {
  const height = Math.round((value / 127) * length)

  drawRectangle(frame, {
    x: position,
    y: start,
    width: 1,
    height,
    lighting: {
      color,
      type: 'static',
    },
  })
}

const main = (): Promise<void> => {
  return new Promise(() => {
    const launchpad = new NovationLaunchpadMiniMk3()
    const frame = new Frame()
    let x = 0

    const update = () => {
      x = (x + 1) % 9
    }

    const render = () => {
      drawRectangle(frame, {
        x: x - 1,
        y: 2,
        width: 3,
        height: 4,
        lighting: {
          type: 'pulsing',
          color: 53,
        },
      })

      drawRectangle(frame, {
        x,
        y: 0,
        width: 1,
        height: 8,
        lighting: {
          type: 'static',
          color: 33,
        },
      })

      drawButton(frame, {
        x,
        y: 0,
        lighting: {
          type: 'static',
          color: 45,
        },
      })
      drawButton(frame, {
        x,
        y: 7,
        lighting: {
          type: 'static',
          color: 45,
        },
      })

      drawFader(frame, {
        position: 3,
        start: 1,
        length: 7,
        value: 127,
        color: [127, 0, 0],
      })
    }

    const showFrame = () => {
      frame.render((values) => {
        const pads = values.map((value) =>
          value.lighting === null ?
            {
              ...value,
              lighting: {
                color: 0,
                type: 'static',
              },
            }
          : value,
        )

        void launchpad.sendCommand('set-led-lighting', {
          pads: pads as PadLighting[],
        })
      })
    }

    const loop = () => {
      update()
      render()
      showFrame()

      setTimeout(loop, 500)
    }

    loop()
  })
}

await main()
