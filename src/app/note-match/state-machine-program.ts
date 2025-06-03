import type { Program } from '../../engine/program.ts'
import { group } from '../../ui/components/group.ts'
import type { Drawable } from '../../ui/drawable.ts'

/**
 * Represents a single state in a StateMachineProgram.
 */
export interface ProgramState {
  /**
   * Callback invoked when this state is entered.
   */
  enter?(): void

  /**
   * Callback invoked when this state is exited.
   */
  exit?(): void

  /**
   * If this state has a visual component, return the corresponding drawable.
   */
  getDrawable?(): Drawable

  /**
   * Returns the final result code for the state. It is an error to call this method if `isDone()` !== `true`.
   */
  getResult(): string

  /**
   * Returns a flag indicating if this state has compelted or not.
   */
  isDone(): boolean

  /**
   * Name of this state, for debugging purposes.
   */
  stateName: string

  /**
   * Called periodically when the application performs updates.
   * @param elapsedSeconds Amount of time, in (possibly fractional) seconds, since the last call to `tick`.
   */
  tick?(elapsedSeconds: number): void
}

type StateConstructor = new () => ProgramState

/**
 * Given a state constructor type, determine the list of results that state can generate.
 */
type RawResultOf<C extends StateConstructor> =
  C extends new () => { getResult(): infer R } ? R : never

/**
 * Type helper that converts the wide type `string` to `never`, allowing us to enforce that an inferred type is
 * narrowed as expected.
 */
type EnforceNotString<T> = string extends T ? never : T

/**
 * Attempts to lookup the result types for a ProgramState constructor. Will resovle the result type string
 * union if possible. If the class was not built with a properly narrowed result type, an error is resolved instead.
 * In this case, try adding a specific type annotation to `getResult`, or annotating the return value `as const`.
 */
type ResultOf<C extends new () => ProgramState> = EnforceNotString<
  RawResultOf<C>
>

/**
 * Type representing a map of known states. The key is the name of the state, and the value is the state's
 * constructor type.
 */
type StateMap<C extends StateConstructor> = {
  [K in C as InstanceType<K>['stateName']]: K
}

/**
 * Given a union `States` = FooStateCtor | BlehStateCtor | ..., and a literal name K = "foo" | "bleh" | ..., this helper
 * finds the one constructor in C whose `stateName` is K.
 */
type StateConstructorByName<
  States extends StateConstructor,
  K extends InstanceType<States>['stateName'],
> = Extract<States, new () => { stateName: K }>

/**
 * Given a union of state constructor types, return a map of 'result code' to 'state constructor' representing the
 * allowed transitions from that state.
 */
type StateTransitionsFor<
  States extends StateConstructor,
  K extends InstanceType<States>['stateName'],
> =
  ResultOf<StateConstructorByName<States, K>> extends never ?
    "ERROR: State's getResult() return type inferred to string; try annotating or adding `as const`"
  : Record<ResultOf<StateConstructorByName<States, K>>, States>

export class StateMachineProgram<States extends StateConstructor>
  implements Program
{
  private state: InstanceType<States>

  public constructor(
    InitialState: States,
    private transitions: {
      [K in InstanceType<States>['stateName']]: StateTransitionsFor<States, K>
    },
  ) {
    this.state = new InitialState() as InstanceType<States>
  }

  /**
   * Advances to the next state, if the current one is done. We split into two steps: (A) extract name + rawResult + do
   * one small cast, then (B) call the generic helper `advanceFor<K>` which “locks in” the literal types.
   */
  private maybeAdvanceToNextState(): void {
    if (!this.state.isDone()) {
      return
    }

    const name = this.state.stateName as InstanceType<States>['stateName']
    const result = this.state.getResult() as keyof StateTransitionsFor<
      States,
      typeof name
    >

    const currentTransitions = this.transitions[name]
    const NextCtor = currentTransitions[result]

    // exit old state
    console.log(`Exiting: ${this.state.stateName}`)
    this.state.exit?.()
    // create next state
    this.state = new (NextCtor as States)() as InstanceType<States>
    // enter new state
    console.log(`Entering: ${this.state.stateName}`)
    this.state.enter?.()
  }

  public getRoot(): Drawable {
    return this.state.getDrawable?.() ?? group()
  }

  public initialize(): void {
    // enter our initial state
    this.state.enter?.()
  }

  shutdown(): void {
    // noop for now
  }

  tick(elapsedSeconds: number): void {
    this.state.tick?.(elapsedSeconds)
    this.maybeAdvanceToNextState()
  }
}
