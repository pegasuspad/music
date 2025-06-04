import { group } from '../ui/components/group.ts'
import type { Drawable } from '../ui/drawable.ts'

/**
 * A `Program` is an exclusive application which defines visual output displayed on a device and the types of input
 * interactions which can be performed.
 */
export interface Program {
  /**
   * Returns the root component of the program's UI.
   */
  getDrawable(): Drawable

  /**
   * Callback which performs optional initialization for this program.
   */
  initialize?: () => Promise<void> | void

  /**
   * Callback which performs optional cleanup (deregister event handlers, etc.) for this program.
   */
  shutdown?: () => Promise<void> | void

  /**
   * Called at a fixed interval to advance the program's state. May be undefined if a program does not perform any
   * proactive updates (i.e. only responds to user generated input events).
   *
   * @param elapsedSeconds Elapsed time, in seconds, from when the last update was performed.
   */
  update?(elapsedSeconds: number): void
}

export interface Entity {
  /**
   * Returns the root component of the entity's visual representation, if any.
   */
  getDrawable?(): Drawable

  /**
   * Aliveness check for entities which can self-expire. If this method returns false, the entity will be removed from
   * the program. Entities will never be auto-removed if this method is undefined.
   */
  isAlive?(): boolean

  /**
   * Called at a fixed interval to advance the entity's state. May be undefined if the entity does not perform any
   * proactive updates.
   *
   * @param elapsedSeconds Elapsed time, in seconds, from when the last update was performed.
   */
  update?(elapsedSeconds: number): void
}

export abstract class BaseProgram implements Program {
  private entities: Map<number, Entity> = new Map<number, Entity>()
  private nextId = 1

  /**
   * Registers an entity with the program, so it will be drawn and updated. Returns the id of the entity, which can
   * be used to call `remove` if needed.
   */
  protected add(entity: Entity): number {
    const id = this.nextId++
    this.entities.set(id, entity)
    return id
  }

  /**
   * Removes the entity with the specified id.
   */
  protected remove(id: number) {
    this.entities.delete(id)
  }

  /**
   * Returns a root drawable which will draw all registered entities.
   */
  public getDrawable(): Drawable {
    const entityDrawables = Array.from(this.entities, ([_, entity]) => {
      return entity.getDrawable?.()
    }).filter((item) => item !== undefined)

    return group(...entityDrawables)
  }

  /**
   * Calls `update` on all registered entities which have an update function.
   */
  public update(elapsedSeconds: number) {
    for (const [id, entity] of this.entities) {
      entity.update?.(elapsedSeconds)
      if (!(entity.isAlive?.() ?? true)) {
        this.remove(id)
      }
    }
  }
}
