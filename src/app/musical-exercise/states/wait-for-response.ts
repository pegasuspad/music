import { type Channel } from 'easymidi'
import type { MidiDevice } from '../../../midi/midi-device.ts'
import type { CallAndResponseContext } from '../call-and-response-context.ts'
import { ChallengeInputHandler } from '../ressponse-input-handler.ts'

export const makeWaitForResponseState =
  ({
    channel,
    device,
    echoChannel,
  }: {
    /**
     * MIDI channel on which user input will be received
     */
    channel: Channel

    /**
     * MIDI device through which the user will provide a response.
     */
    device: MidiDevice

    /**
     * MIDI channel to which notes played by the user will be retransmitted.
     */
    echoChannel: Channel
  }) =>
  ({ challenge }: CallAndResponseContext) => {
    const input = new ChallengeInputHandler(
      device,
      channel,
      echoChannel,
      challenge.handleResponseNote.bind(challenge),
    )

    return {
      enter: () => {
        input.start()
      },
      exit: () => {
        input.stop()
        challenge.reset()
      },
      getResult: () => {
        switch (challenge.getResult()) {
          case 'correct':
            return 'correct'
          case 'incorrect':
            return 'incorrect'
          default:
            throw new Error(
              'Unexpected call to getResult while challenge is still pending.',
            )
        }
      },
      isDone: () => challenge.getResult() !== 'pending',
      stateName: 'wait-for-response' as const,
    }
  }
