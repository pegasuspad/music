import type { Canvas } from './canvas.ts'

/**
 * A `Renderer` translates data from a `Canvas` into a concrete visual representation. Each type of device, such as a
 * MIDI pad controller or device simulator, would have an associated renderer.
 */
export interface Renderer<T> {
  /**
   *
   * @param canvas
   */
  render(canvas: Canvas<T>): void
}
