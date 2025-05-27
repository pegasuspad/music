import { createFader } from '../ui/components/fader.ts'
import { group } from '../ui/components/group.ts'
import type { Program } from '../engine/program.ts'
import { translate } from '../ui/transform/translate.ts'
import { createRectangle } from '../ui/components/rectangle.ts'

export const createPoc = (): Program => {
  const trackLevels = [127, 0, 0, 0]
  let selectedTrack = 0
  let realX = 0
  let x = 0

  const faders = trackLevels.map((level, index) =>
    createFader({
      length: 7,
      onChange: (value) => {
        trackLevels[index] = value
        selectedTrack = index
      },
      orientation: 'horizontal',
      value: level,
      color: [127, 0, 0],
    }),
  )

  return {
    getRoot: () =>
      group(
        ...faders.map((fader, index) => translate(1, 7 - index, fader())),
        ...faders.map((_, index) =>
          translate(
            8,
            7 - index,
            createRectangle({
              color: selectedTrack === index ? [127, 127, 127] : [0, 0, 0],
              onPress: () => {
                selectedTrack = index
              },
              width: 1,
              height: 1,
            }),
          ),
        ),
        // translate(
        //   x,
        //   0,
        //   group(
        //     translate(
        //       -1,
        //       2,
        //       createRectangle({
        //         color: [0, 127, 0],
        //         width: 3,
        //         height: 4,
        //       }),
        //     ),
        //     translate(
        //       0,
        //       0,
        //       createRectangle({
        //         width: 1,
        //         height: 8,
        //         color: [64, 0, 0],
        //       }),
        //     ),
        //     createButton([0, 0, 127]),
        //     translate(0, 7, createButton([0, 0, 127])),
        //   ),
        // ),
      ),
    tick: (elapsedSeconds: number) => {
      realX = (realX + elapsedSeconds * 4.5) % 9
      x = Math.round(realX)
    },
  }
}
