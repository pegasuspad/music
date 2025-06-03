import { currentTimeMillis } from '../../../engine/timer.ts'
import type { ProgramState } from '../state-machine-program.ts'

export class WaitingForInputState implements ProgramState {
  public readonly stateName = 'waiting-for-input'

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
