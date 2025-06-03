import type { Channel } from 'easymidi'
import { StateMachine } from '../state-machine.ts'
import {
  makeInitialContext,
  type CallAndResponseContext,
} from './call-and-response-context.ts'
import type { MidiScheduler } from '../../midi/sequencing.ts'
import { makePlayChallengeState } from './states/play-challenge.ts'
import { makeWaitForResponseState } from './states/wait-for-response.ts'
import type { MidiDevice } from '../../midi/midi-device.ts'
import { makeStartNewChallenge } from './states/start-new-challenge.ts'
import { makePlayPositiveFeedbackState } from './states/play-positive-feedback.ts'

export const createCallAndResponseStateMachine = ({
  challengeChannel,
  device,
  echoChannel,
  feedbackChannel,
  inputChannel,
  midi,
}: {
  /**
   * MIDI channel on which the challenge will be played.
   */
  challengeChannel: Channel

  /**
   * MIDI device through which the user will provide a response.
   */
  device: MidiDevice

  /**
   * MIDI channel to which notes played by the user will be retransmitted.
   */
  echoChannel: Channel

  /**
   * MIDI channel to which feedback such as applause will be played.
   */
  feedbackChannel: Channel

  /**
   * MIDI channel on which user input will be received
   */
  inputChannel: Channel

  /**
   * MIDI scheduler which should be used to play challenges.
   */
  midi: MidiScheduler
}) => {
  const createPlayChallengeState = makePlayChallengeState({
    channel: challengeChannel,
    midi,
  })

  const createPlayPositiveFeedbackState = makePlayPositiveFeedbackState({
    channel: feedbackChannel,
    midi,
  })

  const createStartNewChallenge = makeStartNewChallenge()

  const createWaitForResponseState = makeWaitForResponseState({
    channel: inputChannel,
    device,
    echoChannel,
  })

  type AllStateFactories =
    | typeof createPlayChallengeState
    | typeof createPlayPositiveFeedbackState
    | typeof createStartNewChallenge
    | typeof createWaitForResponseState

  class MusicalExerciseStateMachine extends StateMachine<
    CallAndResponseContext,
    AllStateFactories
  > {
    public constructor() {
      super(makeInitialContext(), createStartNewChallenge, {
        'play-challenge': {
          'wait-for-response': createWaitForResponseState,
        },
        'play-positive-feedback': {
          done: createStartNewChallenge,
        },
        'start-new-challenge': {
          done: createPlayChallengeState,
        },
        'wait-for-response': {
          correct: createPlayPositiveFeedbackState,
          incorrect: createPlayChallengeState,
        },
      })
    }
  }

  return new MusicalExerciseStateMachine()
}

export type CallAndResponseOptions = Parameters<
  typeof createCallAndResponseStateMachine
>[0]
