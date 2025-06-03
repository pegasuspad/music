import { currentTimeMillis } from '../../../engine/timer.ts'
import type { State } from '../../state-machine.ts'

export class ChallengeIntroState implements State {
  public readonly stateName = 'challenge-intro'

  private startAt = 0

  public enter() {
    this.startAt = currentTimeMillis()
  }

  public isDone() {
    return currentTimeMillis() - this.startAt > 2000
  }

  public getResult() {
    return 'done' as const
  }
}
