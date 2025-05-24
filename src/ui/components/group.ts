import type { Drawable } from '../drawable.ts'

/**
 * Creates a group of `Drawables`, which allows them to be composed together into higher level components.
 */
export const createGroup = (...drawables: Drawable[]): Drawable => ({
  draw: (canvas) => {
    drawables.forEach((drawable) => {
      drawable.draw(canvas)
    })
  },
})
