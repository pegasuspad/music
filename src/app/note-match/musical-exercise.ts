import { StateMachineProgram } from './state-machine-program.ts'
import { ChallengeIntroState } from './states/challenge-intro.ts'
import { WaitingForInputState } from './states/waiting-for-input.ts'

type AllStates = typeof ChallengeIntroState | typeof WaitingForInputState

export class MusicalExercise extends StateMachineProgram<AllStates> {
  public constructor() {
    super(ChallengeIntroState, {
      'challenge-intro': {
        done: WaitingForInputState,
      },
      'waiting-for-input': {
        done: ChallengeIntroState,
      },
    })
  }
}
