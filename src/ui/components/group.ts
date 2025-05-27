import type { Drawable } from '../drawable.ts'

/**
 * Creates a group of `Drawables`, which allows them to be composed together into higher level components.
 */
export const group = <T = unknown>(
  ...drawables: Drawable<T>[]
): Drawable<T> => ({
  draw: () => drawables.flatMap((drawable) => drawable.draw()),
  // might need events?
})
