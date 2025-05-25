import type { PressEvent, ReleaseEvent } from './input/input-event.ts'

export interface Cell<T = unknown> {
  /**
   * Optional callback to invoke when this cell is pressed.
   */
  onPress?: (event: PressEvent) => void

  /**
   * Optional callback to invoke when this cell is released.
   */
  onRelease?: (event: ReleaseEvent) => void

  /**
   * Value assigned to this cell.
   */
  value: T

  /**
   * X-coordinate of the cell, where lower values are on the left and higher ones on the right.
   */
  x: number

  /**
   * Y-coordinate of the cell, where lower values are on the bottom and higher ones on the top.
   */
  y: number
}

/**
 * `Drawable` interface representing components which are displayed on a canvas.
 **/
export interface Drawable<T = unknown> {
  /**
   * Draw this component onto the specified canvas.
   */
  draw(): Cell<T>[]
}
