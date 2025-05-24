import type { Canvas } from '../canvas.ts'
import type { Drawable } from '../drawable.ts'

/**
 * Creates a Canvas which draws into an underlying canvas, but applies an offset to each operation.
 */
const translateCanvas = <T = unknown>(
  canvas: Canvas<T>,
  offsetX: number,
  offsetY: number,
): Canvas<T> => ({
  ...canvas,
  set: (x, y, value) => {
    canvas.set(x + offsetX, y + offsetY, value)
  },
})

/**
 * Transforms the given Drawable such that it draws itself at a new position, defined by offsetX and
 * offsetY.
 *
 * @param drawable Drawable to translate.
 * @param x
 *    Distance to move in the horizontal direction. Positive values are to the right, and negative to the left.
 * @param y
 *    Distance to move in the vertical direction. Positive values are up, and negative are down.
 * @returns A new drawable which applies the specified positioning to the original one.
 */
export const placeAt = <T = unknown>(
  x: number,
  y: number,
  drawable: Drawable<T>,
): Drawable<T> => ({
  draw: (canvas) => {
    drawable.draw(translateCanvas(canvas, x, y))
  },
})
