import type { Channel } from 'easymidi'
import type { MidiScheduler } from '../../../midi/sequencing.ts'
import type { CallAndResponseContext } from '../call-and-response-context.ts'

export const makePlayPositiveFeedbackState =
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

    return {
      enter: () => {
        midi.addSequence(
          [
            {
              data: {
                channel,
                number: 15 * 8 + 6,
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
              deltaTimeMs: 1250,
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
      isDone: () => done,
      stateName: 'play-positive-feedback' as const,
    }
  }
