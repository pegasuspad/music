import { StateMachine } from './state-machine.ts'
import { ChallengeIntroState } from './states/challenge-intro.ts'
import { WaitingForInputState } from './states/waiting-for-input.ts'

const createChallengeIntroState = () => new ChallengeIntroState()
const createWaitingForInputState = () => new WaitingForInputState()

export const AllFactories = [
  createChallengeIntroState,
  createWaitingForInputState,
] as const
export type AllStateFactories = (typeof AllFactories)[number]

type AllFactories = () =>
  | typeof createChallengeIntroState
  | typeof createWaitingForInputState

export class MusicalExercise extends StateMachine<object, AllStateFactories> {
  public constructor() {
    super({}, createChallengeIntroState, {
      'challenge-intro': {
        done: createWaitingForInputState,
      },
      'waiting-for-input': {
        done: createChallengeIntroState,
      },
    })
  }
}
