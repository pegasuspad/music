import type { RgbColor } from './color.ts'
import type { Drawable } from './drawable.ts'

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
   * Called at a fixed interval to advance the program's state. May be undefined if a program does not perform any
   * proactive updates (i.e. only responds to user generated input events).
   */
  tick?(): void
}
