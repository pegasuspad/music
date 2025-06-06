import type { Channel } from 'easymidi'
import { animate } from 'popmotion'
import type { MidiScheduler } from '../../../midi/sequencing.ts'
import type { CallAndResponseContext } from '../call-and-response-context.ts'
import type { State } from '../../state-machine.ts'
import { createRectangle } from '../../../ui/components/rectangle.ts'
import { group } from '../../../ui/components/group.ts'
import { translate } from '../../../ui/transform/translate.ts'

const makeRedX = () => {
  let color = 0
  let update: ((elapsedMs: number) => void) | undefined

  animate({
    driver: (callback) => {
      update = callback
      return {
        start: () => {
          update = callback
        },
        stop: () => {
          update = undefined
        },
      }
    },
    duration: 500,
    from: 0,
    repeat: 1,
    repeatType: 'reverse',
    to: 127,
    type: 'spring',
    onUpdate: (latest) => {
      color = latest
    },
  })

  return () => ({
    draw: () => {
      return group(
        ...Array.from({ length: 7 }, (_, y) => y).flatMap((y) => [
          translate(
            y,
            y,
            createRectangle({
              color: [color, 0, 0],
              height: 1,
              width: 1,
            }),
          ),
          translate(
            6 - y,
            y,
            createRectangle({
              color: [color, 0, 0],
              height: 1,
              width: 1,
            }),
          ),
        ]),
      )
    },
    tick: (elapsedSeconds: number) => {
      update?.(elapsedSeconds * 1000)
    },
  })
}

export const makePlayNegativeFeedbackState =
  ({
    channel,
    midi,
  }: {
    /**
     * MIDI channel on which the feedback will be played.
     */
    channel: Channel

    /**
     * MIDI scheduler which should be used to play feedback.
     */
    midi: MidiScheduler
  }) =>
  (_: CallAndResponseContext) => {
    let done = false
    const redX = makeRedX()

    return {
      enter: () => {
        midi.addSequence(
          [
            {
              data: {
                channel,
                number: 118,
              },
              deltaTimeMs: 0,
              deltaType: 'milliseconds',
              event: 'program',
            },
            {
              data: {
                channel,
                note: 60,
                velocity: 96,
              },
              deltaTimeMs: 200,
              deltaType: 'milliseconds',
              event: 'noteon',
            },
            {
              data: {
                channel,
                note: 60,
                velocity: 0,
              },
              deltaTimeMs: 750,
              deltaType: 'milliseconds',
              event: 'noteon',
            },
          ],
          () => {
            done = true
          },
        )
      },
      getResult: () => 'done' as const,
      getDrawable: () => redX().draw(),
      isDone: () => done,
      stateName: 'play-negative-feedback' as const,
      update: (elapsedSeconds: number) => {
        redX().tick(elapsedSeconds)
      },
    } satisfies State
  }
