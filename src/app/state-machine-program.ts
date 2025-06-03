import type { StateFactory, StateMachine } from './state-machine.ts'
import type { Program } from '../engine/program.ts'

/**
 * Creates a `Program` instance which wraps a state machine and forwards lifecycle events to it as needed. The program
 * will display the state machine's UI root as its own.
 */
export const createStateMachineProgram = <
  TContext,
  TFactories extends StateFactory<TContext>,
>(
  stateMachine: StateMachine<TContext, TFactories>,
): Program => {
  return {
    getRoot: () => stateMachine.getRoot(),
    initialize: () => {
      stateMachine.initialize()
    },
    shutdown: () => {
      stateMachine.shutdown()
    },
    tick: (elapsedSeconds: number) => {
      stateMachine.tick(elapsedSeconds)
    },
  }
}
