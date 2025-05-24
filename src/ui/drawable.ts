import type { Canvas } from './canvas.ts'

/**
 * `Drawable` interface representing components which are displayed on a canvas.
 **/
export interface Drawable<T = unknown> {
  /**
   * Draw this component onto the specified canvas.
   */
  draw(canvas: Canvas<T>): void
}
