import type { RgbColor } from '../ui/color.ts'
import type { Drawable } from '../ui/drawable.ts'

/**
 * A `Program` is an exclusive application which defines visual output displayed on a device and the types of input
 * interactions which can be performed.
 */
export interface Program {
  /**
   * Returns the root component of the program's UI.
   */
  getRoot(): Drawable<RgbColor>

  /**
   * Function which performs optional initialization for this program.
   */
  initialize?: () => Promise<void> | void

  /**
   * Callback which is invoked whenever the `Program` state changes and should be rerendered.
   */
  onUpdate?(callback: () => void): void

  /**
   * Called at a fixed interval to advance the program's state. May be undefined if a program does not perform any
   * proactive updates (i.e. only responds to user generated input events).
   *
   * @param elapsedSeconds Elapsed time, in seconds, from when the last update was performed.
   */
  tick?(elapsedSeconds: number): void
}
