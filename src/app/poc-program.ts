import { logger } from '../logger.ts'
import { createButton } from '../ui/components/button.ts'
import { createFader } from '../ui/components/fader.ts'
import { group } from '../ui/components/group.ts'
import { createRectangle } from '../ui/components/rectangle.ts'
import type { Program } from '../engine/program.ts'
import { translate } from '../ui/transform/translate.ts'

let fValue = 127

export const createPoc = (): Program => {
  let realX = 0
  let x = 0

  return {
    getRoot: () =>
      group(
        translate(
          3,
          1,
          createFader({
            length: 7,
            onChange: (value) => {
              logger.info({ value }, 'got fader event')

              fValue = value
            },
            value: fValue,
            color: [127, 0, 0],
          }),
        ),
        translate(
          x,
          0,
          group(
            translate(
              -1,
              2,
              createRectangle({
                color: [0, 127, 0],
                width: 3,
                height: 4,
              }),
            ),
            translate(
              0,
              0,
              createRectangle({
                width: 1,
                height: 8,
                color: [64, 0, 0],
              }),
            ),
            createButton([0, 0, 127]),
            translate(0, 7, createButton([0, 0, 127])),
          ),
        ),
      ),
    tick: (elapsedSeconds: number) => {
      realX = (realX + elapsedSeconds * 4.5) % 9
      x = Math.round(realX)
    },
  }
}
